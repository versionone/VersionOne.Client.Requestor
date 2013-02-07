using System;
using System.Configuration;
using System.Web.Mvc;
using System.Text;

namespace VersionOne.FeatureRequestor.Config.Controllers
{
    public class SetupController : Controller
    {
        public JsonResult Index()
        {
            var auth = VersionOneUserName + ":" + VersionOnePassword;
            var response = new
            {
                Authorization = "Basic " + Convert.ToBase64String(Encoding.ASCII.GetBytes(auth))
            };

            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public string VersionOneUserName
        {
            get { return ConfigurationManager.AppSettings["VersionOneUserName"]; }
        }

        public string VersionOnePassword
        {
            get { return ConfigurationManager.AppSettings["VersionOnePassword"]; }
        }
    }
}