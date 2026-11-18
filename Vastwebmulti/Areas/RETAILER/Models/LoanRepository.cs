using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Vastwebmulti.Models;

namespace Vastwebmulti.Areas.RETAILER.Models
{
    public class LoanRepository
    {
        public List<SelectListItem> GetActiveRetailers()
        {
            using (var db = new VastwebmultiEntities())
            {
                return db.Retailer_Details.Where(aa => aa.ISDeleteuser == false)
                    .OrderBy(r => r.Frm_Name)
                    .Select(r => new SelectListItem
                    {
                        Value = r.RetailerId,
                        Text = r.Frm_Name
                    })
                    .ToList();
            }
        }

        public List<CommissionReportRowVM> GetCommissionReport(
            string retailerId,
            string fromDate,
            string toDate)
        {
            retailerId = string.IsNullOrWhiteSpace(retailerId) ? "" : retailerId;
            DateTime? from = ParseDate(fromDate);
            DateTime? to = ParseDate(toDate);

            using (var db = new VastwebmultiEntities())
            {
                var query =
                    from c in db.LoanCommissions
                    join r in db.Retailer_Details
                        on c.Userid equals r.RetailerId into retailerJoin
                    from retailer in retailerJoin.DefaultIfEmpty()
                    where (string.IsNullOrEmpty(retailerId) || c.Userid == retailerId)
                    select new
                    {
                        Commission = c,
                        FirmName = retailer != null
                            ? retailer.Frm_Name
                            : "N/A"
                    };

                if (from.HasValue)
                {
                    query = query.Where(x =>
                        x.Commission.CreatedDate >= from.Value);
                }

                if (to.HasValue)
                {
                    DateTime toExclusive = to.Value.AddDays(1);

                    query = query.Where(x =>
                        x.Commission.CreatedDate < toExclusive);
                }

                return query
                    .OrderByDescending(x => x.Commission.CreatedDate)
                    .Select(x => new CommissionReportRowVM
                    {
                        Id = x.Commission.Id,
                        LoanApplicationId = x.Commission.LoanApplicationId,

                        ApplicationNo = x.Commission.ApplicationNo,
                        Userid = x.Commission.Userid,
                        RetailerFirmName = x.FirmName,

                        LoanType = x.Commission.LoanType,

                        DisbursedAmount = x.Commission.DisbursedAmount,

                        CommissionPercent = x.Commission.CommissionPercent,
                        Commission = x.Commission.Commission,

                        GstPercent = x.Commission.GstPercent,
                        Gst = x.Commission.Gst,

                        TotalCommission = x.Commission.TotalCommission,

                        TdsPercent = x.Commission.TdsPercent,
                        Tds = x.Commission.Tds,

                        NetAmount = x.Commission.NetAmount,

                        RemainPre = x.Commission.RemainPre,
                        RemainPost = x.Commission.RemainPost,

                        CreatedDate = x.Commission.CreatedDate
                    })
                    .ToList();
            }
        }

        public List<LoanTypeVm> GetActiveLoanTypes()
        {
            using (var db = new VastwebmultiEntities())
            {
                return db.LoanTypes
                    .Where(t => t.IsActive)
                    .OrderBy(t => t.Id)
                    .Select(t => new LoanTypeVm { Id = t.Id, Code = t.Code, Name = t.Name })
                    .ToList();
            }
        }

        public LoanDocumentVm GetDocumentById(long id)
        {
            using (var db = new VastwebmultiEntities())
            {
                var d = db.LoanDocuments.FirstOrDefault(x => x.Id == id);
                if (d == null) return null;

                return new LoanDocumentVm
                {
                    Id = d.Id,
                    LoanApplicationId = d.LoanApplicationId,
                    DocumentType = d.DocumentType,
                    FileName = d.FileName,
                    FilePath = d.FilePath,
                    VerificationStatus = d.VerificationStatus,
                    VerificationRemarks = d.VerificationRemarks,
                    UploadedDate = d.UploadedDate,
                    VerifiedDate = d.VerifiedDate
                };
            }
        }

        public string GetLoanTypeCode(int loanTypeId)
        {
            using (var db = new VastwebmultiEntities())
            {
                return db.LoanTypes.Where(t => t.Id == loanTypeId).Select(t => t.Code).FirstOrDefault();
            }
        }

        public string Websiteurl()
        {
            using (var db = new VastwebmultiEntities())
            {
                return db.Admin_details.Select(t => t.WebsiteUrl).SingleOrDefault();
            }
        }

        public long CreateLoanApplication(LoanApplicationVm a)
        {
            using (var db = new VastwebmultiEntities())
            {
                var entity = new LoanApplication
                {
                    ApplicationNo = "LN" + DateTime.Now.ToString("yyyyMMddHHmmss") + new Random().Next(100, 999),
                    Retailerid = a.RetailerId,
                    LoanTypeId = a.LoanTypeId,
                    FullName = a.FullName,
                    Mobile = a.Mobile,
                    Email = a.Email,
                    DOB = a.DOB,
                    Gender = a.Gender,
                    PAN = a.PAN,
                    AadhaarNo = a.AadhaarNo,          // NEW (personal loan)
                    Address = a.Address,
                    City = a.City,
                    State = a.State,
                    Pincode = a.Pincode,
                    EmploymentType = a.EmploymentType,
                    CompanyName = a.CompanyName,
                    WorkExperienceYears = a.WorkExperienceYears,
                    MonthlyIncome = a.MonthlyIncome,
                    OtherMonthlyIncome = a.OtherMonthlyIncome,
                    ExistingEMI = a.ExistingEMI,
                    ExistingLoans = a.ExistingLoans,
                    LoanAmount = a.LoanAmount,
                    TenureMonths = a.TenureMonths,
                    LoanPurpose = a.LoanPurpose,

                    CaseType = a.CaseType,
                    RefinanceType = a.RefinanceType,
                    CIBILScore = a.CIBILScore,
                    NetMonthlyIncome = a.NetMonthlyIncome,
                    ABB = a.ABB,
                    ITRIncome = a.ITRIncome,
                    Last3MonthsBounceCount = a.Last3MonthsBounceCount,
                    BankStatementMonths = a.BankStatementMonths,
                    InterestRate = a.InterestRate,

                    Status = "NEW",
                    CreatedDate = DateTime.Now
                };

                db.LoanApplications.Add(entity);
                db.SaveChanges();

                a.ApplicationNo = entity.ApplicationNo;
                return entity.Id;
            }
        }

        public void CreateLoanVehicle(LoanVehicleVm v)
        {
            using (var db = new VastwebmultiEntities())
            {
                var entity = new LoanVehicle
                {
                    LoanApplicationId = v.LoanApplicationId,
                    VehicleType = v.VehicleType,
                    Manufacturer = v.Manufacturer,
                    Model = v.Model,
                    Variant = v.Variant,
                    RegistrationNo = v.RegistrationNo,

                    ManufacturingMonth = v.ManufacturingMonth,
                    RegistrationDate = v.RegistrationDate,
                    KMDriven = v.KMDriven,
                    MarketValue = v.MarketValue,

                    ManufacturingYear = v.ManufacturingYear,
                    RegistrationYear = v.RegistrationYear,
                    FuelType = v.FuelType,
                    Transmission = v.Transmission,
                    OwnerNumber = v.OwnerNumber,
                    OnRoadPrice = v.OnRoadPrice,
                    EstimatedCarValue = v.EstimatedCarValue,
                    DownPayment = v.DownPayment,
                    DealerName = v.DealerName,
                    DealerMobile = v.DealerMobile,
                    DealerLocation = v.DealerLocation,
                    SellerName = v.SellerName,
                    SellerMobile = v.SellerMobile,
                    CreatedDate = DateTime.Now
                };

                db.LoanVehicles.Add(entity);
                db.SaveChanges();
            }
        }

        public void CreateExistingLoan(ExistingLoanVm e)
        {
            using (var db = new VastwebmultiEntities())
            {
                var entity = new LoanExistingDetail // adjust to your actual entity/table name
                {
                    LoanApplicationId = e.LoanApplicationId,
                    FinanceCompany = e.FinanceCompany,
                    LoanAccountNo = e.LoanAccountNo,
                    CurrentOutstanding = e.CurrentOutstanding,
                    EMIAmount = e.EMIAmount,
                    TotalEMI = e.TotalEMI,
                    PaidEMI = e.PaidEMI,
                    LastEMIPaidDate = e.LastEMIPaidDate,
                    LoanClosureDate = e.LoanClosureDate,
                    Last3MonthsBounceCount = e.Last3MonthsBounceCount,
                    CreatedDate = DateTime.Now
                };

                db.LoanExistingDetails.Add(entity); // adjust DbSet name to match your EF model
                db.SaveChanges();
            }
        }

        public void AddStatusHistory(long loanAppId, string oldStatus, string newStatus, string remarks, long? changedBy)
        {
            using (var db = new VastwebmultiEntities())
            {
                var entity = new LoanStatusHistory
                {
                    LoanApplicationId = loanAppId,
                    OldStatus = oldStatus,
                    NewStatus = newStatus,
                    Remarks = remarks,
                    ChangedBy = changedBy,
                    ChangedDate = DateTime.Now
                };

                db.LoanStatusHistories.Add(entity);
                db.SaveChanges();
            }
        }

        public List<LoanApplicationVm> GetLoanApplicationsByRetailer(string retailerId, string status, int? loanTypeId, string fromDate, string toDate)
        {
            retailerId = retailerId ?? "";

            DateTime? from = ParseDate(fromDate);
            DateTime? to = ParseDate(toDate);

            using (var db = new VastwebmultiEntities())
            {
                var query =
                    from la in db.LoanApplications
                    join r in db.Retailer_Details
                        on la.Retailerid equals r.RetailerId into retailerJoin
                    from retailer in retailerJoin.DefaultIfEmpty()
                    select new
                    {
                        Loan = la,
                        FirmName = retailer != null ? retailer.Frm_Name : "N/A"
                    };

                if (!string.IsNullOrEmpty(retailerId))
                {
                    query = query.Where(x => x.Loan.Retailerid == retailerId);
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(x => x.Loan.Status == status);
                }

                if (loanTypeId.HasValue)
                {
                    query = query.Where(x => x.Loan.LoanTypeId == loanTypeId.Value);
                }

                if (from.HasValue)
                {
                    query = query.Where(x => x.Loan.CreatedDate >= from.Value);
                }

                if (to.HasValue)
                {
                    DateTime toExclusive = to.Value.AddDays(1);
                    query = query.Where(x => x.Loan.CreatedDate < toExclusive);
                }

                return query
                    .OrderByDescending(x => x.Loan.CreatedDate)
                    .Select(x => new LoanApplicationVm
                    {
                        Id = x.Loan.Id,
                        ApplicationNo = x.Loan.ApplicationNo,

                        RetailerId = x.Loan.Retailerid,
                        RetailerFirmName = x.FirmName,

                        LoanTypeId = x.Loan.LoanTypeId,
                        LoanTypeName = x.Loan.LoanType.Name,

                        FullName = x.Loan.FullName,
                        Mobile = x.Loan.Mobile,
                        Email = x.Loan.Email,

                        LoanAmount = x.Loan.LoanAmount,
                        TenureMonths = x.Loan.TenureMonths,

                        Status = x.Loan.Status,
                        ApprovedAmount = x.Loan.ApprovedAmount,
                        ApprovedDate = x.Loan.ApprovedDate,
                        RejectedDate = x.Loan.RejectedDate,
                        DisbursedDate = x.Loan.DisbursedDate,

                        RejectionReason = x.Loan.RejectionReason,
                        Remarks = x.Loan.Remarks,
                        CreatedDate = x.Loan.CreatedDate,

                        RejectedDocCount = db.LoanDocuments.Count(d =>
                            d.LoanApplicationId == x.Loan.Id &&
                            d.VerificationStatus == "REJECTED")
                    })
                    .ToList();
            }
        }

        private DateTime? ParseDate(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            DateTime result;
            if (DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
                return result;

            if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out result))
                return result;

            return null;
        }

        public LoanApplicationDetailsVm GetLoanApplicationDetails(long id, string retailerId)
        {
            if (retailerId == null)
            {
                retailerId = "";
            }
            using (var db = new VastwebmultiEntities())
            {
                var la = db.LoanApplications
                    .Where(x => x.Id == id && x.Retailerid.Contains(retailerId))
                    .FirstOrDefault();

                if (la == null) return null;

                var result = new LoanApplicationDetailsVm
                {
                    Application = new LoanApplicationVm
                    {
                        Id = la.Id,
                        AadhaarNo = la.AadhaarNo,
                        ApplicationNo = la.ApplicationNo,
                        RetailerId = la.Retailerid,
                        LoanTypeId = la.LoanTypeId,
                        LoanTypeName = la.LoanType.Name,
                        FullName = la.FullName,
                        Mobile = la.Mobile,
                        Email = la.Email,
                        DOB = la.DOB,
                        Gender = la.Gender,
                        PAN = la.PAN,
                        Address = la.Address,
                        City = la.City,
                        State = la.State,
                        Pincode = la.Pincode,
                        EmploymentType = la.EmploymentType,
                        CompanyName = la.CompanyName,
                        WorkExperienceYears = la.WorkExperienceYears,
                        MonthlyIncome = la.MonthlyIncome,
                        OtherMonthlyIncome = la.OtherMonthlyIncome,
                        ExistingEMI = la.ExistingEMI,
                        ExistingLoans = la.ExistingLoans,
                        LoanAmount = la.LoanAmount,
                        TenureMonths = la.TenureMonths,
                        LoanPurpose = la.LoanPurpose,

                        InterestRate = la.InterestRate,
                        CaseType = la.CaseType,
                        RefinanceType = la.RefinanceType,
                        CIBILScore = la.CIBILScore,
                        NetMonthlyIncome = la.NetMonthlyIncome,
                        ABB = la.ABB,
                        ITRIncome = la.ITRIncome,
                        Last3MonthsBounceCount = la.Last3MonthsBounceCount ?? 0,
                        BankStatementMonths = la.BankStatementMonths,

                        Status = la.Status,
                        Remarks = la.Remarks,
                        RejectionReason = la.RejectionReason,
                        ApprovedAmount = la.ApprovedAmount,
                        ApprovedTenureMonths = la.ApprovedTenureMonths,
                        ApprovedDate = la.ApprovedDate,
                        RejectedDate = la.RejectedDate,
                        DisbursedDate = la.DisbursedDate,
                        CreatedDate = la.CreatedDate
                    }
                };

                var vehicle = db.LoanVehicles.Where(v => v.LoanApplicationId == id).FirstOrDefault();
                if (vehicle != null)
                {
                    result.Vehicle = new LoanVehicleVm
                    {
                        Id = vehicle.Id,
                        LoanApplicationId = vehicle.LoanApplicationId,
                        VehicleType = vehicle.VehicleType,
                        Manufacturer = vehicle.Manufacturer,
                        Model = vehicle.Model,
                        Variant = vehicle.Variant,
                        RegistrationNo = vehicle.RegistrationNo,

                        ManufacturingMonth = vehicle.ManufacturingMonth,
                        RegistrationDate = vehicle.RegistrationDate,
                        KMDriven = vehicle.KMDriven,
                        MarketValue = vehicle.MarketValue,

                        ManufacturingYear = vehicle.ManufacturingYear,
                        RegistrationYear = vehicle.RegistrationYear,
                        FuelType = vehicle.FuelType,
                        Transmission = vehicle.Transmission,
                        OwnerNumber = vehicle.OwnerNumber,
                        OnRoadPrice = vehicle.OnRoadPrice,
                        EstimatedCarValue = vehicle.EstimatedCarValue,
                        DownPayment = vehicle.DownPayment,
                        DealerName = vehicle.DealerName,
                        DealerMobile = vehicle.DealerMobile,
                        DealerLocation = vehicle.DealerLocation,
                        SellerName = vehicle.SellerName,
                        SellerMobile = vehicle.SellerMobile
                    };
                }

                // Existing loan (Used Car + Refinance only)
                var existingLoan = db.LoanExistingDetails
                    .Where(e => e.LoanApplicationId == id)
                    .FirstOrDefault();

                if (existingLoan != null)
                {
                    result.ExistingLoan = new ExistingLoanVm
                    {
                        LoanApplicationId = existingLoan.LoanApplicationId,
                        FinanceCompany = existingLoan.FinanceCompany,
                        LoanAccountNo = existingLoan.LoanAccountNo,
                        CurrentOutstanding = existingLoan.CurrentOutstanding,
                        EMIAmount = existingLoan.EMIAmount,
                        TotalEMI = existingLoan.TotalEMI,
                        PaidEMI = existingLoan.PaidEMI,
                        LastEMIPaidDate = existingLoan.LastEMIPaidDate,
                        LoanClosureDate = existingLoan.LoanClosureDate,
                        Last3MonthsBounceCount = existingLoan.Last3MonthsBounceCount
                    };
                }

                result.StatusHistory = db.LoanStatusHistories
                    .Where(h => h.LoanApplicationId == id)
                    .OrderByDescending(h => h.ChangedDate)
                    .Select(h => new LoanStatusHistoryVm
                    {
                        OldStatus = h.OldStatus,
                        NewStatus = h.NewStatus,
                        Remarks = h.Remarks,
                        ChangedDate = h.ChangedDate
                    })
                    .ToList();

                // NEW — uploaded documents (personal loan saves them at Create)
                result.Documents = db.LoanDocuments
                    .Where(d => d.LoanApplicationId == id)
                    .OrderBy(d => d.UploadedDate)
                    .Select(d => new LoanDocumentVm
                    {
                        Id = d.Id,
                        LoanApplicationId = d.LoanApplicationId,
                        DocumentType = d.DocumentType,
                        FileName = d.FileName,
                        FilePath = d.FilePath,
                        VerificationStatus = d.VerificationStatus,
                        VerificationRemarks = d.VerificationRemarks,
                        UploadedDate = d.UploadedDate,
                        VerifiedDate = d.VerifiedDate
                    })
                    .ToList();

                return result;
            }
        }

        // Retailer corrects the information the reviewer flagged
        public bool UpdateApplicantInfo(long id, string retailerId, LoanApplicationVm a)
        {
            using (var db = new VastwebmultiEntities())
            {
                var la = db.LoanApplications.FirstOrDefault(x => x.Id == id && x.Retailerid == retailerId);
                if (la == null) return false;

                la.FullName = a.FullName;
                la.Mobile = a.Mobile;
                la.Email = a.Email;
                la.DOB = a.DOB;
                la.Gender = a.Gender;
                la.PAN = a.PAN;
                la.AadhaarNo = a.AadhaarNo;
                la.Address = a.Address;
                la.City = a.City;
                la.State = a.State;
                la.Pincode = a.Pincode;
                la.EmploymentType = a.EmploymentType;
                la.CompanyName = a.CompanyName;
                la.WorkExperienceYears = a.WorkExperienceYears;
                la.MonthlyIncome = a.MonthlyIncome;
                la.OtherMonthlyIncome = a.OtherMonthlyIncome;
                la.ExistingEMI = a.ExistingEMI;
                la.ExistingLoans = a.ExistingLoans;
                la.LoanAmount = a.LoanAmount;
                la.TenureMonths = a.TenureMonths;
                la.LoanPurpose = a.LoanPurpose;
                la.UpdatedDate = DateTime.Now;

                db.SaveChanges();
                return true;
            }
        }

        public void UpdateVehicleInfo(long loanApplicationId, LoanVehicleVm v)
        {
            using (var db = new VastwebmultiEntities())
            {
                var e = db.LoanVehicles.FirstOrDefault(x => x.LoanApplicationId == loanApplicationId);
                if (e == null) return;

                e.Manufacturer = v.Manufacturer;
                e.Model = v.Model;
                e.Variant = v.Variant;
                e.FuelType = v.FuelType;
                e.Transmission = v.Transmission;

                if (e.VehicleType == "USED")
                {
                    e.RegistrationNo = v.RegistrationNo;
                    e.ManufacturingMonth = v.ManufacturingMonth;
                    e.ManufacturingYear = v.ManufacturingYear;
                    e.RegistrationDate = v.RegistrationDate;
                    e.OwnerNumber = v.OwnerNumber;
                    e.KMDriven = v.KMDriven;
                    e.MarketValue = v.MarketValue;
                }

                db.SaveChanges();
            }
        }

        public bool UpdateStatusByApplicationNo(string applicationNo, string newStatus, string remarks)
        {
            using (var db = new VastwebmultiEntities())
            {
                var la = db.LoanApplications.FirstOrDefault(x => x.ApplicationNo == applicationNo);
                if (la == null) return false;

                var oldStatus = la.Status;
                la.Status = newStatus;
                la.Remarks = remarks;
                la.UpdatedDate = DateTime.Now;

                if (newStatus == "APPROVED") la.ApprovedDate = DateTime.Now;
                if (newStatus == "REJECTED") la.RejectedDate = DateTime.Now;
                if (newStatus == "DISBURSED") la.DisbursedDate = DateTime.Now;

                db.LoanStatusHistories.Add(new LoanStatusHistory
                {
                    LoanApplicationId = la.Id,
                    OldStatus = oldStatus,
                    NewStatus = newStatus,
                    Remarks = remarks,
                    ChangedDate = DateTime.Now
                });

                db.SaveChanges();
                return true;
            }
        }

        public List<LoanDocumentVm> GetDocumentsByLoanApplicationId(long loanApplicationId)
        {
            using (var db = new VastwebmultiEntities())
            {
                return db.LoanDocuments
                    .Where(d => d.LoanApplicationId == loanApplicationId)
                    .OrderByDescending(d => d.UploadedDate)
                    .Select(d => new LoanDocumentVm
                    {
                        Id = d.Id,
                        LoanApplicationId = d.LoanApplicationId,
                        DocumentType = d.DocumentType,
                        FileName = d.FileName,
                        FilePath = d.FilePath,
                        VerificationStatus = d.VerificationStatus,
                        VerificationRemarks = d.VerificationRemarks,
                        UploadedDate = d.UploadedDate,
                        VerifiedDate = d.VerifiedDate
                    })
                    .ToList();
            }
        }

        public void SaveDocument(long loanApplicationId, string documentType, string fileName, string filePath, long? uploadedBy)
        {
            using (var db = new VastwebmultiEntities())
            {
                // If a document of this type was already uploaded, replace it (keep only latest)
                var existing = db.LoanDocuments
                    .FirstOrDefault(d => d.LoanApplicationId == loanApplicationId && d.DocumentType == documentType);

                if (existing != null)
                {
                    existing.FileName = fileName;
                    existing.FilePath = filePath;
                    existing.VerificationStatus = "PENDING";
                    existing.VerificationRemarks = null;
                    existing.UploadedDate = DateTime.Now;
                    existing.VerifiedDate = null;
                    existing.UploadedBy = uploadedBy;
                }
                else
                {
                    db.LoanDocuments.Add(new LoanDocument
                    {
                        LoanApplicationId = loanApplicationId,
                        DocumentType = documentType,
                        FileName = fileName,
                        FilePath = filePath,
                        VerificationStatus = "PENDING",
                        UploadedDate = DateTime.Now,
                        UploadedBy = uploadedBy
                    });
                }

                db.SaveChanges();
            }
        }

        public string GetVehicleTypeByApplicationId(long loanApplicationId)
        {
            using (var db = new VastwebmultiEntities())
            {
                return db.LoanVehicles
                    .Where(v => v.LoanApplicationId == loanApplicationId)
                    .Select(v => v.VehicleType)
                    .FirstOrDefault();
            }
        }

        public LoanApplicationVm GetById(long id)
        {
            using (var db = new VastwebmultiEntities())
            {
                var la = db.LoanApplications.FirstOrDefault(x => x.Id == id);
                if (la == null) return null;

                return new LoanApplicationVm
                {
                    Id = la.Id,
                    ApplicationNo = la.ApplicationNo,
                    RetailerId = la.Retailerid,
                    Status = la.Status,
                    LoanTypeId = la.LoanTypeId
                };
            }
        }

        public bool UpdateDocumentVerification(long documentId, string verificationStatus, string verificationRemarks)
        {
            using (var db = new VastwebmultiEntities())
            {
                var doc = db.LoanDocuments.FirstOrDefault(d => d.Id == documentId);
                if (doc == null) return false;

                doc.VerificationStatus = verificationStatus;
                doc.VerificationRemarks = verificationRemarks;
                doc.VerifiedDate = verificationStatus == "PENDING" ? (DateTime?)null : DateTime.Now;

                db.SaveChanges();
                return true;
            }
        }
    }
}