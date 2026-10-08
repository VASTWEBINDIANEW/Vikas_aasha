using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Vastwebmulti.Areas.RETAILER.Models;

namespace Vastwebmulti.Areas.ADMIN.Models
{
    public class AdminLoanReportFilterVM: LoanReportFilterVM
    {
        public string RetailerId { get; set; }
        public List<SelectListItem> Retailers { get; set; }
    }
}