using System.Collections.Generic;

namespace Vastwebmulti.Areas.RETAILER.Models
{
    // Model for the "Edit & Resubmit" page (loan sent back by the reviewer)
    public class LoanEditVm
    {
        public LoanApplicationVm Application { get; set; }
        public LoanVehicleVm Vehicle { get; set; }

        public string LoanTypeCode { get; set; }     // PERSONAL / NEW_CAR / USED_CAR
        public string CorrectionNote { get; set; }   // message written by the reviewer
    }
}