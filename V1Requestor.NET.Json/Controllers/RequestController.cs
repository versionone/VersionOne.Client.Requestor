using System;
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
        public static string ProjectScopeIdRef = "Scope:0";

        [HttpPost]
        public ContentResult Create(FormCollection form)
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

                var serviceUrl = "http://localhost/VersionOne.Web/rest-1.v1/Data/Request?acceptFormat=" +
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
            client.Headers.Add("Authorization", "Basic " +
                Convert.ToBase64String(Encoding.ASCII.GetBytes("admin:admin")));
            
            return client;
        }
    }
}

////
//// GET: /Request/Edit/5

//public ActionResult Edit(int id)
//{
//    return View();
//}

////
//// POST: /Request/Edit/5

//[HttpPost]
//public ActionResult Edit(int id, FormCollection collection)
//{
//    try
//    {
//        // TODO: Add update logic here

//        return RedirectToAction("Index");
//    }
//    catch
//    {
//        return View();
//    }
//}

////
//// GET: /Request/Delete/5

//public ActionResult Delete(int id)
//{
//    return View();
//}

////
//// POST: /Request/Delete/5

//[HttpPost]
//public ActionResult Delete(int id, FormCollection collection)
//{
//    try
//    {
//        // TODO: Add delete logic here

//        return RedirectToAction("Index");
//    }
//    catch
//    {
//        return View();
//    }
//}