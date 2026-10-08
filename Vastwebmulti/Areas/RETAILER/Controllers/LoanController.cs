using Microsoft.AspNet.Identity;
using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
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
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
        }
        public LoanController()
        {
            // cert = db.cyberplate_info.Select(aa => aa.certcode).FirstOrDefault() ?? "";
        }
        // GET: RETAILER/Loan
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
        // POST: Loan/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(LoanApplicationCreateVM vm)
        {
            var CurrentRetailerId = User.Identity.GetUserId();

            var typeCode = vm.Application.LoanTypeId > 0 ? _repo.GetLoanTypeCode(vm.Application.LoanTypeId) : null;
            bool isCarLoan = typeCode == "NEW_CAR" || typeCode == "USED_CAR";
            bool isUsedCar = typeCode == "USED_CAR";

            // ---- Tenure validation (per loan type) ----
            int minTenure = 3;
            int maxTenure;
            switch (typeCode)
            {
                case "PERSONAL":
                    maxTenure = 60;
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

            if (vm.Application.TenureMonths.HasValue &&
                (vm.Application.TenureMonths.Value < minTenure || vm.Application.TenureMonths.Value > maxTenure))
            {
                ModelState.AddModelError("Application.TenureMonths",
                    string.Format("Tenure for this loan type must be between {0} and {1} months", minTenure, maxTenure));
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

                //    if (!vm.Vehicle.OnRoadPrice.HasValue || vm.Vehicle.OnRoadPrice <= 0)
                //        ModelState.AddModelError("Vehicle.OnRoadPrice", "On-road price is required");

                //    if (!vm.Vehicle.DownPayment.HasValue || vm.Vehicle.DownPayment < 0)
                //        ModelState.AddModelError("Vehicle.DownPayment", "Down payment is required");

                //    if (vm.Vehicle.DownPayment.HasValue && vm.Vehicle.OnRoadPrice.HasValue &&
                //        vm.Vehicle.DownPayment.Value >= vm.Vehicle.OnRoadPrice.Value)
                //        ModelState.AddModelError("Vehicle.DownPayment", "Down payment cannot be greater than or equal to on-road price");

                //    if (string.IsNullOrWhiteSpace(vm.Vehicle.DealerName))
                //        ModelState.AddModelError("Vehicle.DealerName", "Dealer name is required");

                //    if (string.IsNullOrWhiteSpace(vm.Vehicle.DealerMobile))
                //        ModelState.AddModelError("Vehicle.DealerMobile", "Dealer mobile is required");
                //    else if (!System.Text.RegularExpressions.Regex.IsMatch(vm.Vehicle.DealerMobile, @"^[6-9]\d{9}$"))
                //        ModelState.AddModelError("Vehicle.DealerMobile", "Enter a valid 10-digit mobile number");

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
                        if (string.IsNullOrWhiteSpace(vm.Application.RefinanceType))
                            ModelState.AddModelError("Application.RefinanceType", "Please select a refinance type");

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
                        else if (vm.Application.RefinanceType == "NORMAL_REFINANCE" || vm.Application.RefinanceType == "BT_TOPUP")
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

                    // ---- Eligibility ----
                    if (!vm.Application.CIBILScore.HasValue || vm.Application.CIBILScore < 650)
                        ModelState.AddModelError("Application.CIBILScore", "Minimum CIBIL score of 650 is required");
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

            // ---- Send to partner API ----
            // ---- Send to partner API ----
            var existingLoanToSend = (isUsedCar && vm.Application.CaseType == "REFINANCE") ? vm.ExistingLoan : null;
            var apiResponse = SendToApiWebsite(vm.Application, isCarLoan ? vm.Vehicle : null, existingLoanToSend);

            if (apiResponse != null && apiResponse.Status == "RECEIVED")
            {
                TempData["Success"] = "Loan application submitted successfully. Reference: " + apiResponse.ApplicationNo;
            }
            else
            {
                // Application was saved locally either way — API failure shouldn't block the retailer
                TempData["Success"] = "Loan application submitted successfully. (Processing may be delayed.)";
            }

            return RedirectToAction("Index");
        }

        private LoanApiSubmitResponse SendToApiWebsite(LoanApplicationVm app, LoanVehicleVm vehicle, ExistingLoanVm existingLoan)
        {
            try
            {
                var typeCode = _repo.GetLoanTypeCode(app.LoanTypeId);
                var token = getAuthToken();
                var client = new RestClient(VastbazaarBaseUrl);
                var request = new RestRequest("api/loan/submit", Method.POST);
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

                    // NEW
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
                    var result = Newtonsoft.Json.JsonConvert.DeserializeObject<LoanApiSubmitResponse>(response.Content);
                    return result;
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
                            Models.Vastbillpay vb = new Models.Vastbillpay();
                            dynamic json = JsonConvert.DeserializeObject(responsechk);
                            var token = json.access_token.ToString();
                            var expire = json[".expires"].ToString();
                            DateTime exp = Convert.ToDateTime(expire);
                            vastbazzartoken vast = new vastbazzartoken();
                            vast.apitoken = token;
                            vast.exptime = exp;
                            db.vastbazzartokens.Add(vast);
                            db.SaveChanges();
                            return tokn.apitoken;
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
                    var physicalPath = Server.MapPath(doc.FilePath);
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
        // GET: LoanApiAdmin/Documents/5
    }
}