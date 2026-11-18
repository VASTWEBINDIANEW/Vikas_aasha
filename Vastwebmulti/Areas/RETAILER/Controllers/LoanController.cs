using Microsoft.AspNet.Identity;
using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using Vastwebmulti.Areas.RETAILER.Models;
using Vastwebmulti.Models;

namespace Vastwebmulti.Areas.RETAILER.Controllers
{
    [Authorize(Roles = "Retailer")]
    [CutomAttributforpasscodeset()]
    [EKYC_Verification_Filter()]
    [Low_Bal_CustomFilter()]
    public class LoanController : Controller
    {
        private readonly LoanRepository _repo = new LoanRepository();
        string VastbazaarBaseUrl = "http://api.vastbazaar.com/";

        // ---------------------------------------------------------------
        // PERSONAL LOAN CONSTANTS
        // ---------------------------------------------------------------
        private static readonly int[] PersonalTenures = { 24, 36, 48, 72 };
        private static readonly int[] CarTenures = { 24, 36, 48 };

        private const int MinCibil = 650;
        private static readonly string[] CommonDocCodes = { "PAN_CARD", "AADHAAR_FRONT", "AADHAAR_BACK" };

        private static readonly Dictionary<string, string> DocLabels = new Dictionary<string, string>
        {
            { "PAN_CARD",                "PAN card" },
            { "AADHAAR_FRONT",           "Aadhaar card (front)" },
            { "AADHAAR_BACK",            "Aadhaar card (back)" },
            { "SALARY_SLIP_1",           "Salary slip (month 1)" },
            { "SALARY_SLIP_2",           "Salary slip (month 2)" },
            { "SALARY_SLIP_3",           "Salary slip (month 3)" },
            { "FORM_16",                 "Form 16" },
            { "BANK_STATEMENT_6M",       "6-month bank statement" },
            { "EXISTING_LOAN_STATEMENT", "Existing loan statement" },
            { "GA55",                    "GA55" },
            { "ITR_YEAR_1",              "ITR with computation (latest year)" },
            { "ITR_YEAR_2",              "ITR with computation (previous year)" },
            { "ITR_YEAR_3",              "ITR with computation (year before)" },
            { "CONSULTATION_FORM",       "Consultation form" },
            { "RC_COPY",                 "RC (registration certificate)" },
            { "INSURANCE_COPY",          "Insurance" }
        };

        // Documents for the submitted application: code -> required?
        private Dictionary<string, bool> GetDocRules(LoanApplicationCreateVM vm, string typeCode)
        {
            var d = new Dictionary<string, bool>();
            foreach (var c in CommonDocCodes) d[c] = true;

            var emp = vm.Application.EmploymentType;

            if (emp == "SALARIED")
            {
                d["SALARY_SLIP_1"] = true;
                d["SALARY_SLIP_2"] = true;
                d["SALARY_SLIP_3"] = true;
                d["FORM_16"] = true;
            }

            if (typeCode == "PERSONAL")
            {
                d["BANK_STATEMENT_6M"] = true;
                d["EXISTING_LOAN_STATEMENT"] = false;
            }
            else
            {
                if (emp == "SELF_EMPLOYED" || emp == "BUSINESS") d["GA55"] = true;
                if (emp == "BUSINESS")
                {
                    d["ITR_YEAR_1"] = true;
                    d["ITR_YEAR_2"] = true;
                    d["ITR_YEAR_3"] = true;
                }

                if (typeCode == "NEW_CAR") d["CONSULTATION_FORM"] = true;

                if (typeCode == "USED_CAR")
                {
                    d["RC_COPY"] = true;
                    d["INSURANCE_COPY"] = true;
                    if (vm.Application.CaseType == "REFINANCE") d["EXISTING_LOAN_STATEMENT"] = true;
                }
            }

            return d;
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
        }

        public LoanController()
        {
            // cert = db.cyberplate_info.Select(aa => aa.certcode).FirstOrDefault() ?? "";
        }

        // GET: Loan/Create
        public ActionResult Create()
        {
            var vm = new LoanApplicationCreateVM
            {
                LoanTypes = _repo.GetActiveLoanTypes()
            };
            return View(vm);
        }

        // POST: Loan/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(LoanApplicationCreateVM vm)
        {
            var CurrentRetailerId = User.Identity.GetUserId();

            var typeCode = vm.Application.LoanTypeId > 0 ? _repo.GetLoanTypeCode(vm.Application.LoanTypeId) : null;
            bool isCarLoan = typeCode == "NEW_CAR" || typeCode == "USED_CAR";
            bool isUsedCar = typeCode == "USED_CAR";
            bool isPersonal = typeCode == "PERSONAL";

            // ---- Tenure validation (per loan type) ----
            int minTenure = isPersonal ? 24 : 3;
            int maxTenure;
            switch (typeCode)
            {
                case "PERSONAL":
                    maxTenure = 72;
                    break;
                case "NEW_CAR":
                    maxTenure = 84;
                    break;
                case "USED_CAR":
                    maxTenure = 60;
                    break;
                default:
                    maxTenure = 360;
                    break;
            }

            if (isCarLoan && (!vm.Application.TenureMonths.HasValue || !CarTenures.Contains(vm.Application.TenureMonths.Value)))
            {
                ModelState.AddModelError("Application.TenureMonths", "Select a tenure of 24, 36 or 48 months");
            }
            else if (!isCarLoan && vm.Application.TenureMonths.HasValue &&
                (vm.Application.TenureMonths.Value < minTenure || vm.Application.TenureMonths.Value > maxTenure))
            {
                ModelState.AddModelError("Application.TenureMonths",
                    string.Format("Tenure for this loan type must be between {0} and {1} months", minTenure, maxTenure));
            }

            // ---- Common validation: CIBIL, PAN, Aadhaar, employment documents ----
            var docRules = new Dictionary<string, bool>();
            if (isPersonal || isCarLoan)
            {
                docRules = GetDocRules(vm, typeCode);
                ValidateGatedLoan(vm, typeCode, docRules);
            }

            // ---- Vehicle validation (only when Car loan types selected) ----
            if (isCarLoan)
            {
                if (string.IsNullOrWhiteSpace(vm.Vehicle.Manufacturer))
                    ModelState.AddModelError("Vehicle.Manufacturer", "Manufacturer is required");

                if (string.IsNullOrWhiteSpace(vm.Vehicle.Model))
                    ModelState.AddModelError("Vehicle.Model", "Model is required");

                if (string.IsNullOrWhiteSpace(vm.Vehicle.Variant))
                    ModelState.AddModelError("Vehicle.Variant", "Variant is required");

                if (string.IsNullOrWhiteSpace(vm.Vehicle.FuelType))
                    ModelState.AddModelError("Vehicle.FuelType", "Fuel type is required");

                if (string.IsNullOrWhiteSpace(vm.Vehicle.Transmission))
                    ModelState.AddModelError("Vehicle.Transmission", "Transmission is required");

                //if (typeCode == "NEW_CAR")
                //{
                //    if (!vm.Vehicle.ManufacturingYear.HasValue)
                //        ModelState.AddModelError("Vehicle.ManufacturingYear", "Manufacturing year is required");
                //
                //    if (!vm.Vehicle.OnRoadPrice.HasValue || vm.Vehicle.OnRoadPrice <= 0)
                //        ModelState.AddModelError("Vehicle.OnRoadPrice", "On-road price is required");
                //
                //    if (!vm.Vehicle.DownPayment.HasValue || vm.Vehicle.DownPayment < 0)
                //        ModelState.AddModelError("Vehicle.DownPayment", "Down payment is required");
                //
                //    if (vm.Vehicle.DownPayment.HasValue && vm.Vehicle.OnRoadPrice.HasValue &&
                //        vm.Vehicle.DownPayment.Value >= vm.Vehicle.OnRoadPrice.Value)
                //        ModelState.AddModelError("Vehicle.DownPayment", "Down payment cannot be greater than or equal to on-road price");
                //
                //    if (string.IsNullOrWhiteSpace(vm.Vehicle.DealerName))
                //        ModelState.AddModelError("Vehicle.DealerName", "Dealer name is required");
                //
                //    if (string.IsNullOrWhiteSpace(vm.Vehicle.DealerMobile))
                //        ModelState.AddModelError("Vehicle.DealerMobile", "Dealer mobile is required");
                //    else if (!Regex.IsMatch(vm.Vehicle.DealerMobile, @"^[6-9]\d{9}$"))
                //        ModelState.AddModelError("Vehicle.DealerMobile", "Enter a valid 10-digit mobile number");
                //
                //    if (string.IsNullOrWhiteSpace(vm.Vehicle.DealerLocation))
                //        ModelState.AddModelError("Vehicle.DealerLocation", "Dealer location is required");
                //}

                if (isUsedCar)
                {
                    if (string.IsNullOrWhiteSpace(vm.Vehicle.RegistrationNo))
                        ModelState.AddModelError("Vehicle.RegistrationNo", "Registration number is required for a used car");

                    if (!vm.Vehicle.ManufacturingMonth.HasValue)
                        ModelState.AddModelError("Vehicle.ManufacturingMonth", "Manufacturing month is required for a used car");

                    if (!vm.Vehicle.ManufacturingYear.HasValue)
                        ModelState.AddModelError("Vehicle.ManufacturingYear", "Manufacturing year is required for a used car");

                    if (!vm.Vehicle.RegistrationDate.HasValue)
                        ModelState.AddModelError("Vehicle.RegistrationDate", "Registration date is required for a used car");

                    if (string.IsNullOrWhiteSpace(vm.Vehicle.OwnerNumber))
                        ModelState.AddModelError("Vehicle.OwnerNumber", "Owner number is required for a used car");

                    if (!vm.Vehicle.KMDriven.HasValue || vm.Vehicle.KMDriven < 0)
                        ModelState.AddModelError("Vehicle.KMDriven", "KM driven is required for a used car");

                    if (!vm.Vehicle.MarketValue.HasValue || vm.Vehicle.MarketValue <= 0)
                        ModelState.AddModelError("Vehicle.MarketValue", "Current market value is required for a used car");

                    // ---- Case type / Refinance type ----
                    if (string.IsNullOrWhiteSpace(vm.Application.CaseType))
                    {
                        ModelState.AddModelError("Application.CaseType", "Please select Purchase Case or Refinance Case");
                    }
                    else if (vm.Application.CaseType == "REFINANCE")
                    {
                        if (vm.Application.RefinanceType != "CLOSE_BT" && vm.Application.RefinanceType != "BT_TOPUP")
                            ModelState.AddModelError("Application.RefinanceType", "Please select Close BT or BT + Top-Up");

                        if (string.IsNullOrWhiteSpace(vm.ExistingLoan.FinanceCompany))
                            ModelState.AddModelError("ExistingLoan.FinanceCompany", "Finance company is required");

                        if (string.IsNullOrWhiteSpace(vm.ExistingLoan.LoanAccountNo))
                            ModelState.AddModelError("ExistingLoan.LoanAccountNo", "Loan account number is required");

                        if (vm.Application.RefinanceType == "CLOSE_BT")
                        {
                            if (!vm.ExistingLoan.LoanClosureDate.HasValue)
                                ModelState.AddModelError("ExistingLoan.LoanClosureDate", "Loan closure date is required for Close BT");
                            else if (vm.ExistingLoan.LoanClosureDate.Value < DateTime.Today.AddMonths(-6))
                                ModelState.AddModelError("ExistingLoan.LoanClosureDate", "Previous loan must have been closed within the last 6 months");
                        }
                        else if (vm.Application.RefinanceType == "BT_TOPUP")
                        {
                            if (!vm.ExistingLoan.CurrentOutstanding.HasValue || vm.ExistingLoan.CurrentOutstanding < 0)
                                ModelState.AddModelError("ExistingLoan.CurrentOutstanding", "Current outstanding is required");

                            if (!vm.ExistingLoan.EMIAmount.HasValue || vm.ExistingLoan.EMIAmount < 0)
                                ModelState.AddModelError("ExistingLoan.EMIAmount", "Current EMI is required");
                        }

                        if (vm.Application.RefinanceType == "BT_TOPUP")
                        {
                            if (!vm.ExistingLoan.TotalEMI.HasValue)
                                ModelState.AddModelError("ExistingLoan.TotalEMI", "Total loan EMI is required");

                            if (!vm.ExistingLoan.PaidEMI.HasValue)
                                ModelState.AddModelError("ExistingLoan.PaidEMI", "EMI paid is required");
                            else if (vm.ExistingLoan.PaidEMI.Value < 12)
                                ModelState.AddModelError("ExistingLoan.PaidEMI", "Minimum 12 EMI payments are required for Balance Transfer + Top-Up");
                        }

                        if (vm.ExistingLoan.Last3MonthsBounceCount > 0)
                            ModelState.AddModelError("ExistingLoan.Last3MonthsBounceCount", "No EMI bounce is allowed in the previous 3 months");
                    }

                    // ---- Vehicle age policy ----
                    if (vm.Vehicle.ManufacturingYear.HasValue && vm.Vehicle.ManufacturingMonth.HasValue)
                    {
                        var mfgDate = new DateTime(vm.Vehicle.ManufacturingYear.Value, vm.Vehicle.ManufacturingMonth.Value, 1);
                        var ageYears = (DateTime.Today.Year - mfgDate.Year) - (DateTime.Today.Month < mfgDate.Month ? 1 : 0);
                        var maxAge = vm.Application.CaseType == "PURCHASE" ? 15 : 11;

                        if (ageYears > maxAge)
                            ModelState.AddModelError("Vehicle.ManufacturingYear",
                                string.Format("Vehicle age is {0} years. Maximum allowed age for this case is {1} years.", ageYears, maxAge));
                    }
                }
            }
            else
            {
                // Not a car loan — strip any leftover Vehicle.* / ExistingLoan.* validation errors so they don't block submission
                var vehicleKeys = ModelState.Keys.Where(k => k.StartsWith("Vehicle.") || k.StartsWith("ExistingLoan.")).ToList();
                foreach (var key in vehicleKeys) ModelState.Remove(key);
            }

            if (!ModelState.IsValid)
            {
                vm.LoanTypes = _repo.GetActiveLoanTypes();
                return View(vm);
            }

            vm.Application.RetailerId = CurrentRetailerId;

            long loanId = _repo.CreateLoanApplication(vm.Application);

            if (isCarLoan)
            {
                vm.Vehicle.LoanApplicationId = loanId;
                vm.Vehicle.VehicleType = typeCode == "NEW_CAR" ? "NEW" : "USED";
                _repo.CreateLoanVehicle(vm.Vehicle);

                if (isUsedCar && vm.Application.CaseType == "REFINANCE")
                {
                    vm.ExistingLoan.LoanApplicationId = loanId;
                    _repo.CreateExistingLoan(vm.ExistingLoan);
                }
            }

            _repo.AddStatusHistory(loanId, null, "NEW", "Application submitted by retailer", null);

            // ---- Save the uploaded documents locally ----
            var personalDocsSaved = new List<string>();
            var personalDocErrors = new List<string>();
            if (isPersonal || isCarLoan)
            {
                SaveApplicationDocuments(loanId, vm.Application.ApplicationNo, docRules, personalDocsSaved, personalDocErrors);
            }

            // ---- Send application to partner API ----
            var existingLoanToSend = (isUsedCar && vm.Application.CaseType == "REFINANCE") ? vm.ExistingLoan : null;
            var apiResponse = SendToApiWebsite(vm.Application, isCarLoan ? vm.Vehicle : null, existingLoanToSend);

            // ---- Push saved documents to partner API ----
            if (personalDocsSaved.Any())
            {
                try
                {
                    var docs = _repo.GetDocumentsByLoanApplicationId(loanId)
                        .Where(d => personalDocsSaved.Contains(d.DocumentType))
                        .ToList();

                    SendDocumentsToApiWebsite(vm.Application.ApplicationNo, docs, null);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Trace.TraceError("Personal loan document push exception: " + ex.Message);
                }
            }

            if (apiResponse != null && apiResponse.Status == "RECEIVED")
            {
                TempData["Success"] = "Loan application submitted successfully. Reference: " + apiResponse.ApplicationNo;
            }
            else
            {
                // Application was saved locally either way — API failure shouldn't block the retailer
                TempData["Success"] = "Loan application submitted successfully. (Processing may be delayed.)";
            }

            if (personalDocErrors.Any())
            {
                TempData["Error"] = "Some documents could not be saved, please upload them again from the application: " +
                                    string.Join("; ", personalDocErrors);
            }

            return RedirectToAction("Index");
        }

        // ---------------------------------------------------------------
        // PERSONAL LOAN: VALIDATION
        // ---------------------------------------------------------------
        private void ValidateGatedLoan(LoanApplicationCreateVM vm, string typeCode, Dictionary<string, bool> docRules)
        {
            var a = vm.Application;

            // CIBIL gate
            if (!a.CIBILScore.HasValue)
                ModelState.AddModelError("Application.CIBILScore", "CIBIL score is required");
            else if (a.CIBILScore.Value < MinCibil)
                ModelState.AddModelError("Application.CIBILScore", "Not eligible for loan. Minimum CIBIL score required is " + MinCibil + ".");

            // PAN
            if (!string.IsNullOrWhiteSpace(a.PAN))
                a.PAN = a.PAN.Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(a.PAN) || !Regex.IsMatch(a.PAN, @"^[A-Z]{5}[0-9]{4}[A-Z]$"))
                ModelState.AddModelError("Application.PAN", "Enter a valid PAN (e.g. ABCDE1234F)");

            // Aadhaar (12 digits + Verhoeff checksum)
            if (!IsValidAadhaar(a.AadhaarNo))
                ModelState.AddModelError("Application.AadhaarNo", "Enter a valid 12-digit Aadhaar number");

            // Employment
            if (typeCode == "PERSONAL")
            {
                if (a.EmploymentType != "SALARIED")
                    ModelState.AddModelError("Application.EmploymentType", "Only salaried applicants are eligible for a personal loan");

                if (!a.TenureMonths.HasValue || !PersonalTenures.Contains(a.TenureMonths.Value))
                    ModelState.AddModelError("Application.TenureMonths", "Select a tenure of 24, 36, 48 or 72 months");
            }
            else if (a.EmploymentType != "SALARIED" && a.EmploymentType != "SELF_EMPLOYED" && a.EmploymentType != "BUSINESS")
            {
                ModelState.AddModelError("Application.EmploymentType", "Select an employment type");
            }

            // Documents
            foreach (var d in docRules)
            {
                var err = CheckUploadedFile(d.Key, DocLabels[d.Key], d.Value);
                if (err != null) ModelState.AddModelError("", err);
            }
        }

        private string CheckUploadedFile(string code, string label, bool required)
        {
            var f = Request.Files[code];

            if (f == null || f.ContentLength == 0)
                return required ? label + " is required" : null;

            var ext = Path.GetExtension(Path.GetFileName(f.FileName) ?? string.Empty).ToLowerInvariant();

            if (ext != ".pdf" && ext != ".jpg" && ext != ".jpeg" && ext != ".png")
                return label + ": only PDF, JPG, PNG files are allowed";

            if (f.ContentLength > 5 * 1024 * 1024)
                return label + ": file size must be under 5 MB";

            if (!HasValidSignature(f, ext))
                return label + ": file content does not match its type";

            return null;
        }

        // ---------------------------------------------------------------
        // PERSONAL LOAN: SAVE DOCUMENTS
        // ---------------------------------------------------------------
        private void SaveApplicationDocuments(long loanId, string applicationNo, Dictionary<string, bool> docRules, List<string> saved, List<string> errors)
        {
            foreach (var d in docRules)
            {
                var f = Request.Files[d.Key];
                if (f == null || f.ContentLength == 0) continue;

                try
                {
                    var originalName = Path.GetFileName(f.FileName);
                    var path = SaveUploadedDocument(f, applicationNo, d.Key);
                    _repo.SaveDocument(loanId, d.Key, originalName, path, null);
                    saved.Add(d.Key);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Trace.TraceError("Loan document save failed (" + d.Key + "): " + ex.Message);
                    errors.Add(DocLabels[d.Key]);
                }
            }
        }

        // ---------------------------------------------------------------
        // AADHAAR: VERHOEFF CHECKSUM
        // ---------------------------------------------------------------
        private static readonly int[,] VerhoeffD =
        {
            {0,1,2,3,4,5,6,7,8,9},
            {1,2,3,4,0,6,7,8,9,5},
            {2,3,4,0,1,7,8,9,5,6},
            {3,4,0,1,2,8,9,5,6,7},
            {4,0,1,2,3,9,5,6,7,8},
            {5,9,8,7,6,0,4,3,2,1},
            {6,5,9,8,7,1,0,4,3,2},
            {7,6,5,9,8,2,1,0,4,3},
            {8,7,6,5,9,3,2,1,0,4},
            {9,8,7,6,5,4,3,2,1,0}
        };

        private static readonly int[,] VerhoeffP =
        {
            {0,1,2,3,4,5,6,7,8,9},
            {1,5,7,6,2,8,3,0,9,4},
            {5,8,0,3,7,9,6,1,4,2},
            {8,9,1,6,0,4,3,5,2,7},
            {9,4,5,3,1,2,6,8,7,0},
            {4,2,8,6,5,7,3,9,0,1},
            {2,7,9,3,8,0,6,4,1,5},
            {7,0,4,6,9,1,3,2,5,8}
        };

        public static bool IsValidAadhaar(string aadhaar)
        {
            if (string.IsNullOrEmpty(aadhaar) || !Regex.IsMatch(aadhaar, @"^[2-9][0-9]{11}$"))
                return false;

            int c = 0;
            for (int i = 0; i < aadhaar.Length; i++)
            {
                int digit = aadhaar[aadhaar.Length - 1 - i] - '0';
                c = VerhoeffD[c, VerhoeffP[i % 8, digit]];
            }
            return c == 0;
        }

        // ---------------------------------------------------------------
        // PARTNER API
        // ---------------------------------------------------------------
        private LoanApiSubmitResponse SendToApiWebsite(LoanApplicationVm app, LoanVehicleVm vehicle, ExistingLoanVm existingLoan, string endpoint = "api/loan/submit")
        {
            try
            {
                var typeCode = _repo.GetLoanTypeCode(app.LoanTypeId);
                var token = getAuthToken();
                var client = new RestClient(VastbazaarBaseUrl);
                var request = new RestRequest(endpoint, Method.POST);
                request.RequestFormat = DataFormat.Json;
                request.AddHeader("authorization", "bearer " + token + "");
                request.AddHeader("Content-Type", "application/json");
                var payload = new
                {
                    ApplicationNo = app.ApplicationNo,
                    LoanTypeCode = typeCode,

                    FullName = app.FullName,
                    Mobile = app.Mobile,
                    Email = app.Email,
                    DOB = app.DOB,
                    Gender = app.Gender,
                    PAN = app.PAN,
                    AadhaarNo = app.AadhaarNo,

                    Address = app.Address,
                    City = app.City,
                    State = app.State,
                    Pincode = app.Pincode,

                    EmploymentType = app.EmploymentType,
                    CompanyName = app.CompanyName,
                    WorkExperienceYears = app.WorkExperienceYears,
                    MonthlyIncome = app.MonthlyIncome,
                    OtherMonthlyIncome = app.OtherMonthlyIncome,
                    ExistingEMI = app.ExistingEMI,
                    ExistingLoans = app.ExistingLoans,

                    LoanAmount = app.LoanAmount,
                    TenureMonths = app.TenureMonths,
                    LoanPurpose = app.LoanPurpose,
                    InterestRate = app.InterestRate,

                    CaseType = app.CaseType,
                    RefinanceType = app.RefinanceType,

                    CIBILScore = app.CIBILScore,
                    NetMonthlyIncome = app.NetMonthlyIncome,
                    ABB = app.ABB,
                    ITRIncome = app.ITRIncome,
                    Last3MonthsBounceCount = app.Last3MonthsBounceCount,
                    BankStatementMonths = app.BankStatementMonths,

                    Vehicle = vehicle == null ? null : new
                    {
                        VehicleType = vehicle.VehicleType,
                        Manufacturer = vehicle.Manufacturer,
                        Model = vehicle.Model,
                        Variant = vehicle.Variant,
                        RegistrationNo = vehicle.RegistrationNo,
                        ManufacturingMonth = vehicle.ManufacturingMonth,
                        ManufacturingYear = vehicle.ManufacturingYear,
                        RegistrationDate = vehicle.RegistrationDate,
                        RegistrationYear = vehicle.RegistrationYear,
                        FuelType = vehicle.FuelType,
                        Transmission = vehicle.Transmission,
                        OwnerNumber = vehicle.OwnerNumber,
                        KMDriven = vehicle.KMDriven,
                        MarketValue = vehicle.MarketValue,
                        OnRoadPrice = vehicle.OnRoadPrice,
                        EstimatedCarValue = vehicle.EstimatedCarValue,
                        DownPayment = vehicle.DownPayment,
                        DealerName = vehicle.DealerName,
                        DealerMobile = vehicle.DealerMobile,
                        DealerLocation = vehicle.DealerLocation,
                        SellerName = vehicle.SellerName,
                        SellerMobile = vehicle.SellerMobile
                    },

                    ExistingLoan = existingLoan == null ? null : new
                    {
                        FinanceCompany = existingLoan.FinanceCompany,
                        LoanAccountNo = existingLoan.LoanAccountNo,
                        CurrentOutstanding = existingLoan.CurrentOutstanding,
                        EMIAmount = existingLoan.EMIAmount,
                        TotalEMI = existingLoan.TotalEMI,
                        PaidEMI = existingLoan.PaidEMI,
                        LastEMIPaidDate = existingLoan.LastEMIPaidDate,
                        LoanClosureDate = existingLoan.LoanClosureDate,
                        Last3MonthsBounceCount = existingLoan.Last3MonthsBounceCount
                    }
                };
                var requestinfo = JsonConvert.SerializeObject(payload);
                request.AddJsonBody(payload);

                IRestResponse response = client.Execute(request);

                if (response.StatusCode == HttpStatusCode.OK && !string.IsNullOrEmpty(response.Content))
                {
                    var result = ParseApiResponse(response.Content);
                    if (result != null) return result;
                }

                System.Diagnostics.Trace.TraceError(
                    "Loan API submit failed. Status: " + response.StatusCode +
                    " | Content: " + response.Content +
                    " | Error: " + response.ErrorMessage);

                return null;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError("Loan API submit exception: " + ex.Message);
                return null;
            }
        }

        // The partner API wraps its result: { "Version":"1.0", "StatusCode":200, "Content": { "Status":"RECEIVED", ... } }
        // Plain { "Status":..., "ApplicationNo":... } is accepted too.
        private static LoanApiSubmitResponse ParseApiResponse(string json)
        {
            var root = Newtonsoft.Json.Linq.JObject.Parse(json);
            var node = root["Content"] as Newtonsoft.Json.Linq.JObject ?? root;
            return node.ToObject<LoanApiSubmitResponse>();
        }

        public class LoanApiSubmitResponse
        {
            public string Status { get; set; }
            public string ApplicationNo { get; set; }
        }

        // GET: Loan/Index (Report)
        public ActionResult Index(LoanReportFilterVM filter)
        {
            var CurrentRetailerId = User.Identity.GetUserId();
            filter.LoanTypes = _repo.GetActiveLoanTypes();
            filter.Results = _repo.GetLoanApplicationsByRetailer(
                CurrentRetailerId, filter.Status, filter.LoanTypeId, filter.FromDate, filter.ToDate);

            return View(filter);
        }

        // GET: Loan/CommissionReport
        [HttpGet]
        public ActionResult CommissionReport(CommissionReportVM filter)
        {
            string currentRetailerId = User.Identity.GetUserId();

            // Retailer can only view their own commission rows
            filter.RetailerId = currentRetailerId;

            if (string.IsNullOrWhiteSpace(filter.FromDate))
                filter.FromDate = DateTime.Today.ToString("yyyy-MM-dd");
            if (string.IsNullOrWhiteSpace(filter.ToDate))
                filter.ToDate = DateTime.Today.ToString("yyyy-MM-dd");

            filter.Retailers = new List<SelectListItem>
            {
                new SelectListItem
                {
                    Text = "My Firm",
                    Value = currentRetailerId,
                    Selected = true
                }
            };

            filter.Results = _repo.GetCommissionReport(
                currentRetailerId,
                filter.FromDate,
                filter.ToDate);

            filter.TotalDisbursedAmount = filter.Results.Sum(x => x.DisbursedAmount);
            filter.TotalCommission = filter.Results.Sum(x => x.TotalCommission);
            filter.TotalGst = filter.Results.Sum(x => x.Gst);
            filter.TotalTds = filter.Results.Sum(x => x.Tds);
            filter.TotalNetAmount = filter.Results.Sum(x => x.NetAmount);

            return View(filter);
        }

        // GET: Loan/Edit/5  (only while the reviewer has asked for corrections)
        public ActionResult Edit(long id)
        {
            var details = _repo.GetLoanApplicationDetails(id, User.Identity.GetUserId());
            if (details == null) return HttpNotFound();

            if (details.Application.Status != "CORRECTION_REQUIRED")
            {
                TempData["Error"] = "This application is not open for correction.";
                return RedirectToAction("Details", new { id });
            }

            return View(new LoanEditVm
            {
                Application = details.Application,
                Vehicle = details.Vehicle,
                LoanTypeCode = _repo.GetLoanTypeCode(details.Application.LoanTypeId),
                CorrectionNote = details.Application.Remarks
            });
        }

        // POST: Loan/Edit/5  -> save, set status back to VERIFICATION, push to the API for re-verification
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(long id, LoanEditVm vm)
        {
            var retailerId = User.Identity.GetUserId();
            var current = _repo.GetLoanApplicationDetails(id, retailerId);
            if (current == null) return HttpNotFound();

            if (current.Application.Status != "CORRECTION_REQUIRED")
            {
                TempData["Error"] = "This application is not open for correction.";
                return RedirectToAction("Details", new { id });
            }

            var typeCode = _repo.GetLoanTypeCode(current.Application.LoanTypeId);
            bool isCar = typeCode == "NEW_CAR" || typeCode == "USED_CAR";
            var a = vm.Application;

            // Fields the retailer cannot change
            vm.LoanTypeCode = typeCode;
            vm.CorrectionNote = current.Application.Remarks;

            // The posted model only carries editable fields; drop validation noise for the rest
            foreach (var key in ModelState.Keys.Where(k => !k.StartsWith("Application.") && !k.StartsWith("Vehicle.")).ToList())
                ModelState.Remove(key);

            if (string.IsNullOrWhiteSpace(a.FullName)) ModelState.AddModelError("Application.FullName", "Full name is required");
            if (string.IsNullOrWhiteSpace(a.Mobile) || !Regex.IsMatch(a.Mobile.Trim(), @"^[6-9]\d{9}$"))
                ModelState.AddModelError("Application.Mobile", "Enter a valid 10-digit mobile number");

            a.PAN = (a.PAN ?? "").Trim().ToUpperInvariant();
            if (!Regex.IsMatch(a.PAN, @"^[A-Z]{5}[0-9]{4}[A-Z]$"))
                ModelState.AddModelError("Application.PAN", "Enter a valid PAN (e.g. ABCDE1234F)");

            if (!IsValidAadhaar(a.AadhaarNo))
                ModelState.AddModelError("Application.AadhaarNo", "Enter a valid 12-digit Aadhaar number");

            if (string.IsNullOrWhiteSpace(a.Address)) ModelState.AddModelError("Application.Address", "Address is required");
            if (string.IsNullOrWhiteSpace(a.City)) ModelState.AddModelError("Application.City", "City is required");
            if (string.IsNullOrWhiteSpace(a.State)) ModelState.AddModelError("Application.State", "State is required");
            if (string.IsNullOrWhiteSpace(a.Pincode)) ModelState.AddModelError("Application.Pincode", "Pincode is required");

            if (typeCode == "PERSONAL" && a.EmploymentType != "SALARIED")
                ModelState.AddModelError("Application.EmploymentType", "Only salaried applicants are eligible for a personal loan");

            if (a.LoanAmount <= 0) ModelState.AddModelError("Application.LoanAmount", "Enter the loan amount");

            var allowedTenures = typeCode == "PERSONAL" ? PersonalTenures : CarTenures;
            if (!a.TenureMonths.HasValue || !allowedTenures.Contains(a.TenureMonths.Value))
                ModelState.AddModelError("Application.TenureMonths", "Select a valid tenure");

            if (isCar)
            {
                if (vm.Vehicle == null)
                    ModelState.AddModelError("", "Vehicle details are required");
                else
                {
                    if (string.IsNullOrWhiteSpace(vm.Vehicle.Manufacturer)) ModelState.AddModelError("Vehicle.Manufacturer", "Manufacturer is required");
                    if (string.IsNullOrWhiteSpace(vm.Vehicle.Model)) ModelState.AddModelError("Vehicle.Model", "Model is required");
                    if (string.IsNullOrWhiteSpace(vm.Vehicle.Variant)) ModelState.AddModelError("Vehicle.Variant", "Variant is required");
                }
            }

            if (!ModelState.IsValid)
                return View(vm);

            _repo.UpdateApplicantInfo(id, retailerId, a);
            if (isCar && vm.Vehicle != null) _repo.UpdateVehicleInfo(id, vm.Vehicle);

            var appNo = current.Application.ApplicationNo;

            // Push the corrected data to the API portal. The status becomes RESUBMITTED only after the
            // API has accepted it, so the reviewer knows the entry changed and must be verified again.
            var fresh = _repo.GetLoanApplicationDetails(id, retailerId);
            var resp = SendToApiWebsite(fresh.Application, fresh.Vehicle, fresh.ExistingLoan, "api/loan/resubmit");

            if (resp == null || resp.Status != "RECEIVED")
            {
                TempData["Error"] = "Your changes are saved, but they could not be sent to the reviewer right now. Please click Save & Resubmit again.";
                return RedirectToAction("Edit", new { id });
            }

            _repo.UpdateStatusByApplicationNo(appNo, "RESUBMITTED", "Information corrected by retailer and sent for re-verification");

            TempData["Success"] = "Corrected information sent to the reviewer for re-verification.";

            return RedirectToAction("Details", new { id });
        }

        // GET: Loan/Details/5
        public ActionResult Details(long id)
        {
            var currentRetailerId = User.Identity.GetUserId();
            var details = _repo.GetLoanApplicationDetails(id, currentRetailerId);

            if (details == null)
                return HttpNotFound();

            return View(details);
        }

        public string getAuthToken()
        {
            using (var db = new VastwebmultiEntities())
            {
                try
                {
                    var tokn = db.vastbazzartokens.SingleOrDefault();
                    if (tokn == null)
                    {
                        var response = tokencheck();
                        var responsechk = response.Content.ToString();
                        var responsecode = response.StatusCode.ToString();
                        if (responsecode == "OK")
                        {
                            dynamic json = JsonConvert.DeserializeObject(responsechk);
                            var token = json.access_token.ToString();
                            var expire = json[".expires"].ToString();
                            DateTime exp = Convert.ToDateTime(expire);
                            vastbazzartoken vast = new vastbazzartoken();
                            vast.apitoken = token;
                            vast.exptime = exp;
                            db.vastbazzartokens.Add(vast);
                            db.SaveChanges();
                            return token;   // was: tokn.apitoken (tokn is null here -> NullReferenceException)
                        }
                        else
                        {
                            return null;
                        }
                    }
                    else
                    {
                        DateTime curntdate = DateTime.Now.Date;
                        DateTime expdate = Convert.ToDateTime(tokn.exptime).Date;
                        if (expdate > curntdate)
                        {
                            return tokn.apitoken;
                        }
                        else
                        {
                            var response = tokencheck();
                            var responsechk = response.Content.ToString();
                            var responsecode = response.StatusCode.ToString();
                            if (responsecode == "OK")
                            {
                                dynamic json = JsonConvert.DeserializeObject(responsechk);
                                var token = json.access_token.ToString();
                                var expire = json[".expires"].ToString();
                                DateTime exp = Convert.ToDateTime(expire);
                                tokn.apitoken = token;
                                tokn.exptime = exp;
                                db.SaveChanges();
                                return token;
                            }
                            else
                            {
                                return null;
                            }
                        }
                    }
                }
                catch
                {
                    return null;
                }
            }
        }

        public IRestResponse tokencheck()
        {
            using (var db = new VastwebmultiEntities())
            {
                var apidetails = db.Money_API_URLS.Where(aa => aa.API_Name == "VASTWEB").SingleOrDefault();
                var token = apidetails == null ? "" : apidetails.Token;
                var apiid = apidetails == null ? "" : apidetails.API_ID;
                var apiidpwd = apidetails == null ? "" : apidetails.Api_pwd;
                var client = new RestClient(VastbazaarBaseUrl + "token");
                var request = new RestRequest(Method.POST);
                request.AddHeader("iptoken", token);
                request.AddHeader("content-type", "application/x-www-form-urlencoded");
                request.AddParameter("application/x-www-form-urlencoded", "UserName=" + apiid + "&Password=" + apiidpwd + "&grant_type=password", ParameterType.RequestBody);
                IRestResponse response = client.Execute(request);
                return response;
            }
        }

        // GET: Loan/UploadDocuments/5
        public ActionResult UploadDocuments(long id)
        {
            var retailerId = User.Identity.GetUserId();
            var app = _repo.GetById(id);

            if (app == null || app.RetailerId != retailerId)
                return HttpNotFound();

            var vehicleType = (_repo.GetVehicleTypeByApplicationId(id) ?? string.Empty).Trim().ToUpperInvariant();

            // GroupBy avoids an ArgumentException if the same DocumentType was uploaded twice; keep the latest
            var uploaded = _repo.GetDocumentsByLoanApplicationId(id)
                .GroupBy(d => d.DocumentType)
                .ToDictionary(g => g.Key, g => g.Last());

            var vm = new LoanDocumentUploadVm
            {
                LoanApplicationId = id,
                ApplicationNo = app.ApplicationNo,
                Status = app.Status,
                VehicleType = vehicleType,
                IdentityDocs = LoanDocumentCatalog.IdentityDocuments,
                FinancialDocs = LoanDocumentCatalog.FinancialDocuments,
                VehicleDocs = LoanDocumentCatalog.GetVehicleDocuments(vehicleType), // USED now includes GA55_FORM16
                UploadedDocuments = uploaded
            };

            return View(vm);
        }

        public static string GetFullPath(string relativePath)
        {
            var root = Path.GetFullPath(@"D:\");   // normalized -> D:\
            if (!root.EndsWith(Path.DirectorySeparatorChar.ToString()))
                root += Path.DirectorySeparatorChar;

            var rel = (relativePath ?? string.Empty).TrimStart('~', '/', '\\').Replace('/', '\\');
            var full = Path.GetFullPath(Path.Combine(root, rel));

            if (!full.StartsWith(root, StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("Invalid path");

            return full;
        }

        public ActionResult ViewDocument(long id)
        {
            var retailerId = User.Identity.GetUserId();

            var doc = _repo.GetDocumentById(id);
            if (doc == null || string.IsNullOrWhiteSpace(doc.FilePath)) return HttpNotFound();

            var app = _repo.GetById(doc.LoanApplicationId);
            if (app == null || app.RetailerId != retailerId) return HttpNotFound();

            // Resolve from shared DocumentRoot (traversal check is inside GetFullPath)
            string physicalPath;
            try
            {
                physicalPath = GetFullPath(doc.FilePath);
            }
            catch (UnauthorizedAccessException)
            {
                return HttpNotFound();
            }

            if (!System.IO.File.Exists(physicalPath)) return HttpNotFound();

            // Only serve the formats the upload form accepts
            var ext = Path.GetExtension(physicalPath).ToLowerInvariant();
            if (ext != ".pdf" && ext != ".jpg" && ext != ".jpeg" && ext != ".png")
                return HttpNotFound();

            var contentType = GetContentType(ext);

            var fileName = Path.GetFileName(string.IsNullOrWhiteSpace(doc.FileName) ? physicalPath : doc.FileName);
            var cd = new System.Net.Mime.ContentDisposition { FileName = fileName, Inline = true };

            Response.AppendHeader("Content-Disposition", cd.ToString());
            Response.AppendHeader("X-Content-Type-Options", "nosniff");
            Response.Cache.SetCacheability(HttpCacheability.Private);

            return File(physicalPath, contentType);
        }

        private string GetContentType(string extension)
        {
            switch (extension)
            {
                case ".pdf": return "application/pdf";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".png": return "image/png";
                default: return "application/octet-stream";
            }
        }

        // POST: Loan/ReuploadDocument/5   (id = document id, only for REJECTED documents)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ReuploadDocument(long id)
        {
            var retailerId = User.Identity.GetUserId();

            var doc = _repo.GetDocumentById(id);
            if (doc == null) return HttpNotFound();

            var app = _repo.GetById(doc.LoanApplicationId);
            if (app == null || app.RetailerId != retailerId) return HttpNotFound();

            if (doc.VerificationStatus != "REJECTED")
            {
                TempData["Error"] = "Only rejected documents can be re-uploaded.";
                return RedirectToAction("Details", new { id = app.Id });
            }

            var label = doc.DocumentType.Replace("_", " ");
            var err = CheckUploadedFile("ReuploadFile", label, true);
            if (err != null)
            {
                TempData["Error"] = err;
                return RedirectToAction("Details", new { id = app.Id });
            }

            try
            {
                var file = Request.Files["ReuploadFile"];
                var originalName = Path.GetFileName(file.FileName);
                var savedPath = SaveUploadedDocument(file, app.ApplicationNo, doc.DocumentType);

                // SaveDocument replaces the existing row and resets it to PENDING
                _repo.SaveDocument(app.Id, doc.DocumentType, originalName, savedPath, null);

                try
                {
                    var fresh = _repo.GetDocumentsByLoanApplicationId(app.Id)
                        .Where(d => d.DocumentType == doc.DocumentType)
                        .ToList();
                    SendDocumentsToApiWebsite(app.ApplicationNo, fresh, null);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Trace.TraceError("Re-upload push failed: " + ex.Message);
                }

                TempData["Success"] = label + " re-uploaded successfully. It will be verified again.";
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError("Re-upload failed: " + ex.Message);
                TempData["Error"] = label + " could not be saved, please try again.";
            }

            return RedirectToAction("Details", new { id = app.Id });
        }

        // POST: Loan/UploadDocuments/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult UploadDocuments(long id, FormCollection form)
        {
            var retailerId = User.Identity.GetUserId();
            var app = _repo.GetById(id);

            if (app == null || app.RetailerId != retailerId)
                return HttpNotFound();

            var vehicleType = (_repo.GetVehicleTypeByApplicationId(id) ?? string.Empty).Trim().ToUpperInvariant();
            var allDocTypes = LoanDocumentCatalog.GetAllRequiredDocuments(vehicleType); // USED includes GA55_FORM16

            var alreadyUploaded = _repo.GetDocumentsByLoanApplicationId(id)
                .GroupBy(d => d.DocumentType)
                .ToDictionary(g => g.Key, g => g.Last());

            var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
            var errors = new List<string>();
            var missingRequired = new List<string>();
            var newlyUploadedDocTypes = new List<string>();

            foreach (var docDef in allDocTypes)
            {
                var file = Request.Files[docDef.Code];
                bool alreadyHasFile = alreadyUploaded.ContainsKey(docDef.Code);

                if (file != null && file.ContentLength > 0)
                {
                    var originalName = Path.GetFileName(file.FileName); // some browsers send a full path
                    var ext = Path.GetExtension(originalName).ToLowerInvariant();

                    if (!allowedExtensions.Contains(ext))
                    {
                        errors.Add(docDef.Label + ": only PDF, JPG, PNG files are allowed");
                        continue;
                    }

                    if (file.ContentLength > 5 * 1024 * 1024)
                    {
                        errors.Add(docDef.Label + ": file size must be under 5 MB");
                        continue;
                    }

                    if (!HasValidSignature(file, ext))
                    {
                        errors.Add(docDef.Label + ": file content does not match its type");
                        continue;
                    }

                    try
                    {
                        var savedPath = SaveUploadedDocument(file, app.ApplicationNo, docDef.Code);
                        _repo.SaveDocument(id, docDef.Code, originalName, savedPath, null);
                        newlyUploadedDocTypes.Add(docDef.Code);
                    }
                    catch (Exception)
                    {
                        // log ex here
                        errors.Add(docDef.Label + ": could not be saved, please try again");
                    }
                }
                else if (docDef.Required && !alreadyHasFile)
                {
                    missingRequired.Add(docDef.Label);
                }
            }

            // Move status forward only if every required document is now present
            string newStatusForApi = null;
            if (app.Status == "DOCUMENT_REQUIRED")
            {
                var nowUploaded = _repo.GetDocumentsByLoanApplicationId(id)
                    .Select(d => d.DocumentType)
                    .Distinct()
                    .ToList();

                if (allDocTypes.Where(d => d.Required).All(d => nowUploaded.Contains(d.Code)))
                {
                    _repo.UpdateStatusByApplicationNo(app.ApplicationNo, "VERIFICATION", "Documents uploaded by retailer, pending verification");
                    newStatusForApi = "VERIFICATION";
                }
            }

            // Push whatever was saved to Website B, even if other files in this submission failed
            if (newlyUploadedDocTypes.Any())
            {
                try
                {
                    var freshlyUploaded = _repo.GetDocumentsByLoanApplicationId(id)
                        .Where(d => newlyUploadedDocTypes.Contains(d.DocumentType))
                        .ToList();

                    SendDocumentsToApiWebsite(app.ApplicationNo, freshlyUploaded, newStatusForApi);
                }
                catch (Exception)
                {
                    // log ex here; documents are saved locally, so don't fail the retailer's upload
                }
            }

            if (errors.Any() || missingRequired.Any())
            {
                var msg = new List<string>();
                if (errors.Any()) msg.Add(string.Join("; ", errors));
                if (missingRequired.Any()) msg.Add("Please upload the following required documents: " + string.Join(", ", missingRequired));

                TempData["Error"] = string.Join(" | ", msg);
                return RedirectToAction("UploadDocuments", new { id });
            }

            TempData["Success"] = "Documents uploaded successfully.";
            return RedirectToAction("Details", new { id });
        }

        private static bool HasValidSignature(HttpPostedFileBase file, string ext)
        {
            var header = new byte[8];
            file.InputStream.Position = 0;
            var read = file.InputStream.Read(header, 0, header.Length);
            file.InputStream.Position = 0; // reset so SaveUploadedDocument can read it
            if (read < 4) return false;

            switch (ext)
            {
                case ".pdf": return header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46; // %PDF
                case ".png": return header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
                case ".jpg":
                case ".jpeg": return header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
                default: return false;
            }
        }

        public static string GetSiteKeyFromUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url)) return null;

            url = url.Trim();
            if (!url.Contains("://")) url = "http://" + url;   // handle URLs without scheme

            var host = new Uri(url).Host.ToLowerInvariant();   // drops scheme, port, path, trailing /

            if (host.StartsWith("www.")) host = host.Substring(4);

            // keep only safe folder characters
            return string.Concat(host.Where(c => char.IsLetterOrDigit(c) || c == '.' || c == '-'));
        }

        public static string GetFolder(string relativeFolder)
        {
            var full = GetFullPath(relativeFolder);
            Directory.CreateDirectory(full);
            return full;
        }

        private string SaveUploadedDocument(HttpPostedFileBase file, string applicationNo, string docCode)
        {
            if (file == null || file.ContentLength == 0)
                throw new InvalidOperationException("No file uploaded.");

            var siteKey = GetSiteKeyFromUrl(_repo.Websiteurl());
            if (string.IsNullOrEmpty(siteKey))
                throw new InvalidOperationException("Website URL not configured.");

            var safeAppNo = new string((applicationNo ?? string.Empty)
                .Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_').ToArray());
            if (string.IsNullOrEmpty(safeAppNo))
                throw new InvalidOperationException("Invalid application number.");

            var safeDocCode = new string((docCode ?? string.Empty)
                .Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_').ToArray());
            if (string.IsNullOrEmpty(safeDocCode))
                throw new InvalidOperationException("Invalid document code.");

            var ext = Path.GetExtension(Path.GetFileName(file.FileName) ?? string.Empty).ToLowerInvariant();
            if (ext != ".pdf" && ext != ".jpg" && ext != ".jpeg" && ext != ".png")
                throw new InvalidOperationException("File type not allowed.");

            var folderRelative = siteKey + "/LoanDocuments/" + safeAppNo;
            var folderPhysical = GetFolder(folderRelative);   // D:\<siteKey>\LoanDocuments\<appNo>

            var safeFileName = safeDocCode + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + "_" +
                               Guid.NewGuid().ToString("N").Substring(0, 6) + ext;

            file.SaveAs(Path.Combine(folderPhysical, safeFileName));

            return folderRelative + "/" + safeFileName;   // relative path stored in DB
        }

        private void SendDocumentsToApiWebsite(string applicationNo, List<LoanDocumentVm> documents, string newStatus)
        {
            for (int i = 0; i < documents.Count; i++)
            {
                var doc = documents[i];
                // Only send NewStatus with the last document in the batch, to avoid redundant status-history entries
                var statusToSend = (i == documents.Count - 1) ? newStatus : null;

                try
                {
                    // Files are stored under D:\ (see SaveUploadedDocument) - Server.MapPath would point to the wrong place
                    var physicalPath = GetFullPath(doc.FilePath);
                    if (!System.IO.File.Exists(physicalPath)) continue;

                    var fileBytes = System.IO.File.ReadAllBytes(physicalPath);
                    var base64Content = Convert.ToBase64String(fileBytes);

                    var token = getAuthToken();
                    var client = new RestClient(VastbazaarBaseUrl);
                    var request = new RestRequest("api/loan/document", Method.POST);
                    request.RequestFormat = DataFormat.Json;
                    request.AddHeader("authorization", "bearer " + token + "");
                    request.AddHeader("Content-Type", "application/json");
                    request.AddJsonBody(new
                    {
                        SourceApplicationNo = applicationNo,
                        SourceDocumentId = doc.Id,
                        DocumentType = doc.DocumentType,
                        FileName = doc.FileName,
                        FileContentBase64 = base64Content,
                        NewStatus = statusToSend,
                        StatusRemarks = statusToSend != null ? "Documents uploaded by retailer, pending verification" : null
                    });

                    var response = client.Execute(request);

                    if (response.StatusCode != System.Net.HttpStatusCode.OK)
                    {
                        System.Diagnostics.Trace.TraceError(
                            "Document API push failed for " + applicationNo + " / " + doc.DocumentType +
                            ". Status: " + response.StatusCode + " | " + response.Content);
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Trace.TraceError(
                        "Document API push exception for " + applicationNo + " / " + doc.DocumentType + ": " + ex.Message);
                }
            }
        }
    }
}