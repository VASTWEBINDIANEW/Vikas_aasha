using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using Vastwebmulti.Models;

namespace Vastwebmulti.Areas.RETAILER.Models
{

        public class LoanTypeVm
        {
            public int Id { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
        }

    public class LoanApplicationVm
    {
        public int Last3MonthsBounceCount { get; set; }
        public decimal? ABB { get; set; }
        public decimal? ITRIncome { get; set; }
        public decimal? InterestRate { get; set; }
        public int? BankStatementMonths { get; set; }
        public int? CIBILScore { get; set; }
        public long Id { get; set; }
        public string ApplicationNo { get; set; }
        public string RetailerId { get; set; }

        [Required(ErrorMessage = "Please select a loan type")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a loan type")]
        public int LoanTypeId { get; set; }
        public string LoanTypeName { get; set; }

        public string CaseType { get; set; }
        public string RefinanceType { get; set; }
        public decimal? NetMonthlyIncome { get; set; }

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(150)]
        [Display(Name = "Full Name")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Mobile number is required")]
        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Enter a valid 10-digit mobile number")]
        public string Mobile { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Enter a valid email address")]
        [StringLength(150)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Date of birth is required")]
        [DataType(DataType.Date)]
        [Display(Name = "Date of Birth")]
        [MinimumAge(18)]
        public DateTime? DOB { get; set; }

        [Required(ErrorMessage = "Please select gender")]
        public string Gender { get; set; }

        [Required(ErrorMessage = "PAN is required")]
        [RegularExpression(@"^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$", ErrorMessage = "Enter a valid PAN (e.g. ABCDE1234F)")]
        [StringLength(10)]
        public string PAN { get; set; }

        [Required(ErrorMessage = "Address is required")]
        [StringLength(500)]
        public string Address { get; set; }

        [Required(ErrorMessage = "City is required")]
        [StringLength(100)]
        public string City { get; set; }

        [Required(ErrorMessage = "State is required")]
        [StringLength(100)]
        public string State { get; set; }

        [Required(ErrorMessage = "Pincode is required")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Enter a valid 6-digit pincode")]
        public string Pincode { get; set; }

        [Required(ErrorMessage = "Please select employment type")]
        [Display(Name = "Employment Type")]
        public string EmploymentType { get; set; }

        [Required(ErrorMessage = "Company name is required")]
        [StringLength(200)]
        [Display(Name = "Company Name")]
        public string CompanyName { get; set; }

        [Required(ErrorMessage = "Work experience is required")]
        [Range(0, 60, ErrorMessage = "Enter a valid number of years (0–60)")]
        [Display(Name = "Work Experience (Years)")]
        public decimal? WorkExperienceYears { get; set; }

        [Required(ErrorMessage = "Monthly income is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Monthly income must be greater than 0")]
        [Display(Name = "Monthly Income")]
        public decimal? MonthlyIncome { get; set; }

        [Required(ErrorMessage = "Enter other monthly income (enter 0 if none)")]
        [Range(0, double.MaxValue, ErrorMessage = "Enter a valid amount")]
        [Display(Name = "Other Monthly Income")]
        public decimal? OtherMonthlyIncome { get; set; }

        [Required(ErrorMessage = "Enter existing EMI (enter 0 if none)")]
        [Range(0, double.MaxValue, ErrorMessage = "Enter a valid amount")]
        [Display(Name = "Existing EMI")]
        public decimal? ExistingEMI { get; set; }

        [Required(ErrorMessage = "Enter number of existing loans (enter 0 if none)")]
        [Range(0, 100, ErrorMessage = "Enter a valid count")]
        [Display(Name = "Existing Loans")]
        public int? ExistingLoans { get; set; }

        [Required(ErrorMessage = "Loan amount is required")]
        [Range(1000, 100000000, ErrorMessage = "Loan amount must be between ₹1,000 and ₹10,00,00,000")]
        [Display(Name = "Loan Amount")]
        public decimal LoanAmount { get; set; }

        [Required(ErrorMessage = "Tenure is required")]
        [Range(1, 360, ErrorMessage = "Tenure must be between 1 and 360 months")]
        [Display(Name = "Tenure (Months)")]
        public int? TenureMonths { get; set; }

        [Required(ErrorMessage = "Loan purpose is required")]
        [StringLength(200)]
        [Display(Name = "Loan Purpose")]
        public string LoanPurpose { get; set; }

        public string Status { get; set; }
        public string Remarks { get; set; }
        public string RejectionReason { get; set; }

        public decimal? ApprovedAmount { get; set; }
        public int? ApprovedTenureMonths { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public DateTime? RejectedDate { get; set; }
        public DateTime? DisbursedDate { get; set; }

        public DateTime CreatedDate { get; set; }
    }

    public class LoanVehicleVm
    {
        public long Id { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public long LoanApplicationId { get; set; }
        public string VehicleType { get; set; }
        public int? KMDriven { get; set; }
        public decimal? MarketValue { get; set; }

        [StringLength(100)]
        public string Manufacturer { get; set; }

        [StringLength(100)]
        public string Model { get; set; }

        [StringLength(150)]
        public string Variant { get; set; }
        public int? ManufacturingMonth { get; set; }

        [StringLength(30)]
        [Display(Name = "Registration No")]
        public string RegistrationNo { get; set; }

        [Range(1990, 2100, ErrorMessage = "Enter a valid year")]
        [Display(Name = "Manufacturing Year")]
        public int? ManufacturingYear { get; set; }

        [Range(1990, 2100, ErrorMessage = "Enter a valid year")]
        [Display(Name = "Registration Year")]
        public int? RegistrationYear { get; set; }

        [Display(Name = "Fuel Type")]
        public string FuelType { get; set; }

        public string Transmission { get; set; }

        [Range(1, 10, ErrorMessage = "Enter a valid owner number")]
        [Display(Name = "Owner Number")]
        public string OwnerNumber { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Enter a valid amount")]
        [Display(Name = "On Road Price")]
        public decimal? OnRoadPrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Enter a valid amount")]
        [Display(Name = "Estimated Car Value")]
        public decimal? EstimatedCarValue { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Enter a valid amount")]
        [Display(Name = "Down Payment")]
        public decimal? DownPayment { get; set; }

        [StringLength(200)]
        [Display(Name = "Dealer Name")]
        public string DealerName { get; set; }

        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Enter a valid 10-digit mobile number")]
        [Display(Name = "Dealer Mobile")]
        public string DealerMobile { get; set; }

        [StringLength(300)]
        [Display(Name = "Dealer Location")]
        public string DealerLocation { get; set; }

        [StringLength(200)]
        [Display(Name = "Seller Name")]
        public string SellerName { get; set; }

        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Enter a valid 10-digit mobile number")]
        [Display(Name = "Seller Mobile")]
        public string SellerMobile { get; set; }
    }

    public class LoanApplicationCreateVM
        {
            public LoanApplicationVm Application { get; set; } = new LoanApplicationVm();
            public LoanVehicleVm Vehicle { get; set; } = new LoanVehicleVm();
            public ExistingLoanVm ExistingLoan { get; set; } = new ExistingLoanVm();
            public List<LoanTypeVm> LoanTypes { get; set; } = new List<LoanTypeVm>();
        }
    public class ExistingLoanVm
    {
        public long LoanApplicationId { get; set; }
        public int Last3MonthsBounceCount { get; set; }
        public string FinanceCompany { get; set; }

        public string LoanAccountNo { get; set; }

        public decimal? CurrentOutstanding { get; set; }

        public decimal? EMIAmount { get; set; }

        public int? TotalEMI { get; set; }

        public int? PaidEMI { get; set; }

        public DateTime? LastEMIPaidDate { get; set; }

        public DateTime? LoanClosureDate { get; set; }
    }

    public class LoanReportFilterVM
    {
        public string Status { get; set; }
        public int? LoanTypeId { get; set; }

        [Display(Name = "From Date")]
        public string FromDate { get; set; }   // was DateTime?

        [Display(Name = "To Date")]
        public string ToDate { get; set; }     // was DateTime?

        public List<LoanTypeVm> LoanTypes { get; set; } = new List<LoanTypeVm>();
        public List<LoanApplicationVm> Results { get; set; } = new List<LoanApplicationVm>();
    }

    public class LoanStatusHistoryVm
    {
        public string OldStatus { get; set; }
        public string NewStatus { get; set; }
        public string Remarks { get; set; }
        public DateTime ChangedDate { get; set; }
    }

    public class LoanApplicationDetailsVm
    {
        public LoanApplicationVm Application { get; set; }
        public LoanVehicleVm Vehicle { get; set; }           // null if not a car loan
        public ExistingLoanVm ExistingLoan { get; set; }     // NEW — null unless Used Car + Refinance
        public List<LoanStatusHistoryVm> StatusHistory { get; set; } = new List<LoanStatusHistoryVm>();
    }

    public class LoanApiListItemVm
    {
        public long Id { get; set; }
        public string ApplicationNo { get; set; }
        public string SourceApplicationNo { get; set; }
        public string ApiId { get; set; }
        public string LoanTypeName { get; set; }
        public string FullName { get; set; }
        public string Mobile { get; set; }
        public decimal LoanAmount { get; set; }
        public string Status { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class LoanApiDetailsVm
    {
        public LoanApplication Application { get; set; }
        public LoanVehicle Vehicle { get; set; }
        public List<LoanStatusHistory> StatusHistory { get; set; } = new List<LoanStatusHistory>();
    }

    public class LoanDocumentVm
    {
        public long Id { get; set; }
        public long LoanApplicationId { get; set; }
        public string DocumentType { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string VerificationStatus { get; set; }
        public string VerificationRemarks { get; set; }
        public DateTime UploadedDate { get; set; }
        public DateTime? VerifiedDate { get; set; }
    }

    public class LoanDocumentUploadVm
    {
        public long LoanApplicationId { get; set; }
        public string ApplicationNo { get; set; }
        public string Status { get; set; }
        public string VehicleType { get; set; } // NEW / USED / null (personal loan)

        public List<DocumentTypeDef> IdentityDocs { get; set; } = new List<DocumentTypeDef>();
        public List<DocumentTypeDef> FinancialDocs { get; set; } = new List<DocumentTypeDef>();
        public List<DocumentTypeDef> VehicleDocs { get; set; } = new List<DocumentTypeDef>();

        // Code -> already-uploaded document (null if not yet uploaded)
        public Dictionary<string, LoanDocumentVm> UploadedDocuments { get; set; } = new Dictionary<string, LoanDocumentVm>();
    }
    public class LoanDocumentsPageVm
    {
        public long LoanApplicationId { get; set; }
        public string ApplicationNo { get; set; }
        public string FullName { get; set; }
        public string Status { get; set; }
        public string VehicleType { get; set; }
        public List<LoanDocumentVm> Documents { get; set; } = new List<LoanDocumentVm>();
    }

}