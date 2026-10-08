using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Vastwebmulti.Areas.RETAILER.Models
{
    public class DocumentTypeDef
    {
        public string Code { get; set; }
        public string Label { get; set; }
        public bool Required { get; set; }
    }

    public static class LoanDocumentCatalog
    {
        public static readonly List<DocumentTypeDef> IdentityDocuments = new List<DocumentTypeDef>
        {
            new DocumentTypeDef { Code = "PAN_CARD", Label = "PAN Card", Required = true },
            new DocumentTypeDef { Code = "AADHAR_FRONT", Label = "Aadhar Card - Front", Required = true },
            new DocumentTypeDef { Code = "AADHAR_BACK", Label = "Aadhar Card - Back", Required = true },
            new DocumentTypeDef { Code = "PHOTO", Label = "Photograph", Required = true }
        };

        public static readonly List<DocumentTypeDef> FinancialDocuments = new List<DocumentTypeDef>
        {
            new DocumentTypeDef { Code = "BANK_STATEMENT", Label = "Bank Statement", Required = true }
        };

        public static readonly List<DocumentTypeDef> UsedCarDocuments = new List<DocumentTypeDef>
        {
            new DocumentTypeDef { Code = "RC", Label = "RC (Registration Certificate)", Required = true },
            new DocumentTypeDef { Code = "INSURANCE", Label = "Insurance", Required = true },
            new DocumentTypeDef { Code = "LOAN_STATEMENT", Label = "Loan Statement / NOC", Required = true },
            new DocumentTypeDef { Code = "GA55_FORM16", Label = "GA 55 / Form 16", Required = true }
        };

        public static readonly List<DocumentTypeDef> NewCarDocuments = new List<DocumentTypeDef>
        {
            new DocumentTypeDef { Code = "INVOICE", Label = "Proforma Invoice / Quotation", Required = true },
            new DocumentTypeDef { Code = "INSURANCE", Label = "Insurance Cover Note", Required = true },
            new DocumentTypeDef { Code = "BOOKING_RECEIPT", Label = "Booking Receipt", Required = false }
        };

        public static List<DocumentTypeDef> GetVehicleDocuments(string vehicleType)
        {
            if (string.Equals(vehicleType, "USED", StringComparison.OrdinalIgnoreCase)) return UsedCarDocuments;
            if (string.Equals(vehicleType, "NEW", StringComparison.OrdinalIgnoreCase)) return NewCarDocuments;
            return new List<DocumentTypeDef>();
        }

        public static List<DocumentTypeDef> GetAllRequiredDocuments(string vehicleType)
        {
            var all = new List<DocumentTypeDef>();
            all.AddRange(IdentityDocuments);
            all.AddRange(FinancialDocuments);
            all.AddRange(GetVehicleDocuments(vehicleType));
            return all;
        }
    }
}