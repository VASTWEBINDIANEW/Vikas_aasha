using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Vastwebmulti.Areas.ADMIN.Models
{
    public class AepsUPIHistoryVM
    {
        public string Firmname { get; set; }
        public int Idno { get; set; }
        public string Retailerid { get; set; }
        public string Merchantid { get; set; }
        public string Status { get; set; }
        public Nullable<decimal> Amount { get; set; }
        public Nullable<decimal> comm { get; set; }
        public Nullable<decimal> totalcomm { get; set; }
        public Nullable<decimal> Remainpre { get; set; }
        public Nullable<decimal> RemainPost { get; set; }
        public Nullable<decimal> Gst { get; set; }
        public Nullable<decimal> tds { get; set; }
        public Nullable<System.DateTime> txndate { get; set; }
        public Nullable<System.DateTime> updatedate { get; set; }
        public string Apirequest { get; set; }
        public string ApiResponse { get; set; }
        public string StatusResponse { get; set; }
        public string Bankrrn { get; set; }
        public string reqtype { get; set; }
        public string customermobile { get; set; }
        public string txntype { get; set; }
        public string PayerVPA { get; set; }
        public string Fingpaytxnid { get; set; }
        public Nullable<System.DateTime> transtimestemp { get; set; }
        public string Txnid { get; set; }
        public Nullable<decimal> Adminremainpre { get; set; }
        public Nullable<decimal> Adminremainpost { get; set; }
        public Nullable<decimal> posremainpre { get; set; }
        public Nullable<decimal> posremainpost { get; set; }
        public string PayerName { get; set; }
    }
}