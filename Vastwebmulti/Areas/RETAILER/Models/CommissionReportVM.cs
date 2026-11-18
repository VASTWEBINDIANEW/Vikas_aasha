using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Vastwebmulti.Areas.RETAILER.Models
{
    public class CommissionReportVM
    {
        public string RetailerId { get; set; }

        public string FromDate { get; set; }
        public string ToDate { get; set; }

        public List<SelectListItem> Retailers { get; set; }

        public List<CommissionReportRowVM> Results { get; set; }

        public decimal TotalDisbursedAmount { get; set; }
        public decimal TotalCommission { get; set; }
        public decimal TotalGst { get; set; }
        public decimal TotalTds { get; set; }
        public decimal TotalNetAmount { get; set; }

        public CommissionReportVM()
        {
            Retailers = new List<SelectListItem>();
            Results = new List<CommissionReportRowVM>();
        }
    }

    public class CommissionReportRowVM
    {
        public long Id { get; set; }
        public long LoanApplicationId { get; set; }

        public string ApplicationNo { get; set; }
        public string Userid { get; set; }
        public string RetailerFirmName { get; set; }

        public string LoanType { get; set; }

        public decimal DisbursedAmount { get; set; }

        public decimal CommissionPercent { get; set; }
        public decimal Commission { get; set; }

        public decimal GstPercent { get; set; }
        public decimal Gst { get; set; }

        public decimal TotalCommission { get; set; }

        public decimal TdsPercent { get; set; }
        public decimal Tds { get; set; }

        public decimal NetAmount { get; set; }

        public decimal RemainPre { get; set; }
        public decimal RemainPost { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}