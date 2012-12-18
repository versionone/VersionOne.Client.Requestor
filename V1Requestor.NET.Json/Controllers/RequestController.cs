using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Text;
using Newtonsoft.Json.Linq;

namespace V1Requestor.NET.Json.Controllers
{
    public class RequestController : Controller
    {
        public string ServiceHostUrl
        {
            get { return ConfigurationManager.AppSettings["ServiceHostUrl"]; }
        }

        public string VersionOneUserName
        {
            get { return ConfigurationManager.AppSettings["VersionOneUserName"]; }
        }

        public string VersionOnePassword
        {
            get { return ConfigurationManager.AppSettings["VersionOnePassword"]; }
        }

        public string ProjectScopeIdRef
        {
            get { return ConfigurationManager.AppSettings["ProjectScopeIdRef"]; }
        }

        [HttpPost]
        public ContentResult Index(FormCollection form)
        {
            var acceptFormat = Request.QueryString["acceptFormat"];
            if (string.IsNullOrWhiteSpace(acceptFormat))
            {
                acceptFormat = "haljson";
            }
            try
            {
                var requestDto = GetDtoData();
                // Add the project idref now
                SetProjectScopeIdRef(requestDto);

                var serviceUrl = ServiceHostUrl + "Request?acceptFormat=" +
                                 HttpUtility.UrlEncode(acceptFormat);

                var client = GetConfiguredWebClient();

                var data = requestDto.ToString();

                var result = client.UploadString(serviceUrl, data);

                return Content(result, acceptFormat);
            }
            catch(Exception ex)
            {
                return Content("{}", acceptFormat);
            }
        }

        public dynamic GetDtoData()
        {
            var data = string.Empty;
            using(var reader = new StreamReader(Request.InputStream))
            {
                data = reader.ReadToEnd();
            }

            var jsonObj = JObject.Parse(data);

            return jsonObj;
        }

        private void SetProjectScopeIdRef(dynamic requestDto)
        {
            requestDto._links.Scope.idref = ProjectScopeIdRef;
        }

        private WebClient GetConfiguredWebClient()
        {
            var contentType = Request.ContentType;

            var client = new WebClient();
            client.Headers.Add("Accept", contentType);
            client.Headers.Add("Content-Type", contentType);
            var auth = VersionOneUserName + ":" + VersionOnePassword;
            client.Headers.Add("Authorization", "Basic " +
                Convert.ToBase64String(Encoding.ASCII.GetBytes(auth)));
            
            return client;
        }
    }
}