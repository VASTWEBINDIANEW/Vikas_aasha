using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Vastwebmulti.Areas.ADMIN.Models
{
    public class LoanModelSlab
    {
        public List<LoanModelCommon> common { get; set; }               // common slab ("ALL"), one row per loan type
        public List<SelectListItem> UserId { get; set; }                // users of the selected role (dropdown)
        public List<SelectListItem> RetailerId { get; set; }
        public List<LoanModelRetailer> Users { get; set; }              // user-wise slab: one row per user x loan type
        public List<UpdateLoanModelRetailer> UpdateAll { get; set; }    // "All Users": one row per loan type, applied to every user of the role
        public string role { get; set; }
        public string SelectedUserId { get; set; }                      // user picked in the dropdown ("" = All Users)
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
    }

    public class LoanModelCommon
    {
        public int idno { get; set; }               // LoanSlab.Id (0 = not created yet)
        public int LoanType { get; set; }           // LoanType id (LoanSlab.LoanType is int)
        public string LoanTypeName { get; set; }
        public decimal? retailercomm { get; set; }  // commission %
    }

    public class LoanModelRetailer
    {
        public int idno { get; set; }
        public decimal? comm { get; set; }          // null = the user has no own slab (uses the common one)
        public string Email { get; set; }
        public string userid { get; set; }
        public string RolesName { get; set; }
        public int LoanType { get; set; }
        public string LoanTypeName { get; set; }
    }

    public class UpdateLoanModelRetailer
    {
        public int idno { get; set; }
        public decimal? comm { get; set; }          // blank = leave unchanged, 0 = clear, >0 = set for every user of the role
        public string LoanTypeName { get; set; }
        public int LoanType { get; set; }
    }
}