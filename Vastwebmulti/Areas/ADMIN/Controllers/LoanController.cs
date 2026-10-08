using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Vastwebmulti.Areas.RETAILER.Models;
using Vastwebmulti.Models;

namespace Vastwebmulti.Areas.ADMIN.Controllers
{
    [Authorize(Roles = "Admin")]
    //[CutomAttributforpasscodeset()]
    public class AdminLoanController : Controller
    {
        private readonly LoanRepository _repo = new LoanRepository();
        private List<SelectListItem> GetRetailers()
        {
            using (var db = new VastwebmultiEntities())
            {
                // ADJUST: table/columns that hold your retailers (id = AspNetUsers Id)
                return db.Retailer_Details
                    .OrderBy(r => r.RetailerName)
                    .Select(r => new SelectListItem
                    {
                        Value = r.RetailerId,
                        Text = r.RetailerName + " (" + r.Mobile + ")"
                    }).ToList();
            }
        }
        // GET: ADMIN/AdminLoan
        public ActionResult Index(Vastwebmulti.Areas.ADMIN.Models.AdminLoanReportFilterVM filter)
        {
            filter.LoanTypes = _repo.GetActiveLoanTypes();
            filter.Retailers = GetRetailers();
            filter.Results = _repo.GetLoanApplicationsByRetailer(
                string.IsNullOrEmpty(filter.RetailerId) ? null : filter.RetailerId,
                filter.Status, filter.LoanTypeId, filter.FromDate, filter.ToDate);
            return View(filter);
        }

        // GET: ADMIN/AdminLoan/Details/5
        public ActionResult Details(long id)
        {
            var details = _repo.GetLoanApplicationDetails(id, null);
            if (details == null) return HttpNotFound();
            return View(details);
        }

        // View-only document access
        public ActionResult ViewDocument(long id)
        {
            var doc = _repo.GetDocumentById(id);
            if (doc == null || string.IsNullOrWhiteSpace(doc.FilePath)) return HttpNotFound();

            var appRoot = Path.GetFullPath(Server.MapPath("~/"));
            var physicalPath = Path.GetFullPath(Server.MapPath(doc.FilePath));
            if (!physicalPath.StartsWith(appRoot, StringComparison.OrdinalIgnoreCase)) return HttpNotFound();
            if (!System.IO.File.Exists(physicalPath)) return HttpNotFound();

            var ext = Path.GetExtension(physicalPath).ToLowerInvariant();
            string contentType;
            switch (ext)
            {
                case ".pdf": contentType = "application/pdf"; break;
                case ".jpg":
                case ".jpeg": contentType = "image/jpeg"; break;
                case ".png": contentType = "image/png"; break;
                default: return HttpNotFound();
            }

            var fileName = Path.GetFileName(string.IsNullOrWhiteSpace(doc.FileName) ? physicalPath : doc.FileName);
            var cd = new System.Net.Mime.ContentDisposition { FileName = fileName, Inline = true };
            Response.AppendHeader("Content-Disposition", cd.ToString());
            Response.AppendHeader("X-Content-Type-Options", "nosniff");
            Response.Cache.SetCacheability(HttpCacheability.Private);
            return File(physicalPath, contentType);
        }
    }
}