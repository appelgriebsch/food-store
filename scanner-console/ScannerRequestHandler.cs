#region MKS Information

//  $Source: ScannerRequestHandler.cs $
//  $ProjectName: m:/MKS/TPDotNet/TP_Customer/Payback/TPEnterprise/Common/dev.net/Desktop/Clients/SilverlightClientHelper/Modules/ScannerRequestHandler/project.pj $
//  Last modified by $Author: Gawrys, Adrian (adrian.gawrys) $
//  $Revision: 1.3 $
//  $Log: ScannerRequestHandler.cs  $
//  Revision 1.3 2013/11/08 08:26:50CET Gawrys, Adrian (adrian.gawrys) 
//  - fix to scanner getting in a locked state if there's an exception in Silverlight Client Helper
//  Revision 1.2 2012/11/08 15:12:16CET _ext Hennig, Christian (christian.hennig.ext) 
//  - issue 983248: PAYBACK Kiosk - Migrate changes from variant "TPEnterprise PAYBACK 1.1" to TPCustomer\PAYBACK
//  Revision 1.35 2012/10/17 17:30:41CEST Becker, Ralph (ralph.becker.ext) 
//  - new member bDecodeData, set from Setting "ScannerRequestHandler.DecodeData"
//  - if bDecodeData=TRUE, set DecodeData and use ScannerDataLabel for decoded scanner data
//    (if ScanDataType unknown, log the ScanData with error, but continue with "*...")
//  - if bDecodeData=FALSE, programmatically remove leading non-numeric characters from ScannerData
//    and use the rest as decoded scanner data (this is the kept former implementation)
//  Revision 1.34 2012/10/15 10:07:23CEST Becker, Ralph (ralph.becker.ext) 
//  - disable (scanner) device in ReleaseScanner() to stop the hardware scanning
//    (in ClaimScanner() the device will already be enabled, if disabled)
//  Revision 1.33 2012/09/17 11:26:12CEST Gerlach, Andreas (andreas.gerlach) 
//  * code doc
//  Revision 1.31 2012/09/11 14:09:48MESZ Gerlach, Andreas (andreas.gerlach) 
//  * remove all prefix values from scanner input string
//  Revision 1.30 2012/09/11 13:48:55MESZ Becker, Ralph (ralph.becker.ext) 
//  - pass this instead of constant to logging methods
//  - added logging in all catch blocks to write ex info to event log
//  - use WriteFunctionEnter/Exit without passing event id (will be done by writer)
//  Revision 1.29 2012/08/15 17:02:34CEST Gerlach, Andreas (andreas.gerlach) 
//  
//  Revision 1.28 2012/08/07 15:10:33MESZ Gerlach, Andreas (andreas.gerlach) 
//  * setting time out for RequestScannerData to 1 min. and returning OperationTimeout if no data has been captured inbetween
//  Revision 1.27 2012/08/01 15:11:01MESZ Gerlach, Andreas (andreas.gerlach) 
//  * increase Claim() timeout
//  Revision 1.26 2012/08/01 14:17:17MESZ Gerlach, Andreas (andreas.gerlach) 
//  * bugfix: scanning problems
//  Revision 1.25 2012/08/01 09:44:31MESZ Gerlach, Andreas (andreas.gerlach) 
//  * locking critical sections to prevent multiple threads to enter each of them in parallel
//  Revision 1.24 2012/07/31 17:01:25MESZ Gerlach, Andreas (andreas.gerlach) 
//  * in case of an error event from scanner Release & Claim the device (again)
//  Revision 1.23 2012/07/12 11:58:26MESZ Gerlach, Andreas (andreas.gerlach) 
//  * increase timeout for claim to 3 secs.
//  Revision 1.22 2012/07/09 15:41:19MESZ Gerlach, Andreas (andreas.gerlach) 
//  * add ClearScannerBuffer() in front of RequestScannerData
//  Revision 1.21 2012/06/28 12:20:54MESZ Gerlach, Andreas (andreas.gerlach) 
//  * just do Claim() / Release() for any subsequent Start-/StopScanner() calls
//  Revision 1.20 2012/06/27 17:21:02MESZ Gerlach, Andreas (andreas.gerlach) 
//  * remove DecodeData flag setting
//  * handle parsing of scanner raw data
//  Revision 1.19 2012/06/27 15:47:36MESZ Gerlach, Andreas (andreas.gerlach) 
//  * try-catch for scanner open/close operations
//  Revision 1.18 2012/06/26 16:23:49MESZ Gerlach, Andreas (andreas.gerlach) 
//  * add special handling to get rid of communication errors
//  Revision 1.17 2012/06/25 20:05:42MESZ Gerlach, Andreas (andreas.gerlach) 
//  * extended error handling
//  Revision 1.16 2012/06/21 14:26:40MESZ Gerlach, Andreas (andreas.gerlach) 
//  * check if scanner is claimed before calling appropriate APIs
//  Revision 1.15 2012/05/09 10:52:06MESZ Gerlach, Andreas (andreas.gerlach) 
//  * enhanced error messages in case of general exceptions
//  Revision 1.14 2012/04/27 16:57:32MESZ Gerlach, Andreas (andreas.gerlach) 
//  * bugfix: error handling when RequestScannerData but Scanner not claimed!
//  Revision 1.13 2012/04/27 12:09:54MESZ Gerlach, Andreas (andreas.gerlach) 
//  * bugfix: resetting internal state after successfully delivering scanner data
//  Revision 1.12 2012/04/26 17:23:02MESZ Gerlach, Andreas (andreas.gerlach) 
//  * new operation: RequestScannerData to wait and return any scanned input
//  Revision 1.11 2012/04/26 15:56:20MESZ Gerlach, Andreas (andreas.gerlach) 
//  * enhancement: handle the response setting at central place in the socket controller
//  Revision 1.10 2012/04/26 14:45:58MESZ Gerlach, Andreas (andreas.gerlach) 
//  * hand-over prepared response object to plugin for just putting in the status & result message
//  Revision 1.9 2012/04/25 18:05:41MESZ Gerlach, Andreas (andreas.gerlach) 
//  * move event source identifier to constants & use it in any request handler as logging source entry
//  Revision 1.8 2012/04/25 15:24:40MESZ Gerlach, Andreas (andreas.gerlach) 
//  * adaptation to new configuration settings
//  * enhanced function-enter/-exit logging
//  Revision 1.7 2012/03/30 16:21:54MESZ Gerlach, Andreas (andreas.gerlach) 
//  * handle configuration error when device that is configured is not available on this system
//  Revision 1.6 2012/03/30 10:54:01MESZ Gerlach, Andreas (andreas.gerlach) 
//  * extend error context by class name
//  Revision 1.5 2012/03/29 17:43:41MESZ Gerlach, Andreas (andreas.gerlach) 
//  * code cleanup by re-using SocketResponse class
//  * text-context keys for error message translation
//  Revision 1.4 2012/03/29 11:29:20MESZ Gerlach, Andreas (andreas.gerlach) 
//  * handling possible OPOS errors and returning them as CustomErrorID
//  Revision 1.3 2012/03/23 11:10:03MEZ Gerlach, Andreas (andreas.gerlach) 
//  * bugfix
//  Revision 1.2 2012/03/19 17:22:58MEZ Gerlach, Andreas (andreas.gerlach) 
//  * implementing new QUERY_CMD operation
//  Revision 1.1 2012/03/13 14:51:21MEZ Gerlach, Andreas (andreas.gerlach) 
//  Initial revision
//  Member added to project m:/MKS/TPDotNet/TPEnterprise/Common/dev.net/Desktop/Clients/SilverlightClientHelper/Modules/ScannerRequestHandler/project.pj

#endregion

using System;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Xml.Linq;
using Microsoft.PointOfService;
using Newtonsoft.Json;


namespace TPDotnet.Enterprise.Common.Desktop.Clients.SilverlightClientHelper
{
    internal struct MessageIn {

        public string evt;
    }

    internal struct ScanResult {

        public string u;
        public string s;
    }

    internal struct MessageOut {

        public string evt;
        public string desc;
        public ScanResult data;
    }

    /// <summary>
    /// handles all requests for communicating w/ the OPOS scanner
    /// </summary>
    public class ScannerRequestHandler
    {
        /// <summary>
        /// Beeps the specified frequenz.
        /// </summary>
        /// <param name="Frequenz">The frequenz.</param>
        /// <param name="Dauer">The number of milliseconds for the beep.</param>
        /// <returns>TRUE/FALSE for signaling the result of the Beep</returns>
        [DllImport("kernel32.dll")]
        static extern bool Beep(int Frequenz, int Dauer);

        /// <summary>
        /// specifies the StartScanner request template
        /// </summary>
        readonly XElement reqStartScanner = new XElement("StartScanner");

        /// <summary>
        /// specifies the StopScanner request template
        /// </summary>
        readonly XElement reqStopScanner = new XElement("StopScanner");

        /// <summary>
        /// specifies the RequestScannerData request template
        /// </summary>
        readonly XElement reqScannerData = new XElement("RequestScannerData");

        #region Private Members

        /// <summary>
        /// holds a reference to the OPOS scanner object
        /// </summary>
        static Scanner s_objScanner = null;

        /// <summary>
        /// an event signaling when scanner data has been arrived
        /// </summary>
        static ManualResetEvent evtWaitScannerData = new ManualResetEvent(false);

        /// <summary>
        /// the DECODED result of the last scan
        /// </summary>
        static string scannerData = null;

        /// <summary>
        /// whether an beep is necessary after getting the scanner data or not
        /// </summary>
        bool bInternalBeep = false;

        /// <summary>
        /// whether to set scanner's DecodeData propterty to TRUE.
        /// (in this case there will be used ScanDataType and ScanDataLabel)
        /// </summary>
        bool bDecodeData = false;

        #endregion

        /// <summary>
        /// the main entry point that is called when a socket request for a specific operation of this request handler
        /// is retrieved
        /// </summary>
        /// <param name="controller">a reference to the public API of the controller</param>
        /// <param name="request">the socket request w/ all parameters and attributes that has been retrieved</param>
        /// <param name="response">a reference to the socket response that is send to the client afterwards</param>
        /// <returns>
        /// an enum value stating the result of the execution of this single request
        /// </returns>
        public string HandleRequest(string request)
        {
            // TODO: return JSONized scanner data
            MessageOut outData = new MessageOut();

            try
            {
                scannerData = string.Empty;

                MessageIn jsonObject = Newtonsoft.Json.JsonConvert.DeserializeObject<MessageIn>(request);

                if (string.Equals(jsonObject.evt, "startScanner", StringComparison.OrdinalIgnoreCase)) {

                    this.StartScanner("Scanner1");
                    this.ClearScannerBuffer();

                    if (evtWaitScannerData.WaitOne())
                    {
                        ScanResult data;
                        try
                        {
                            data = Newtonsoft.Json.JsonConvert.DeserializeObject<ScanResult>(scannerData.Substring(scannerData.IndexOf("{")), new JsonSerializerSettings { StringEscapeHandling = StringEscapeHandling.EscapeNonAscii });
                            outData.evt = "data";
                            outData.data = data;
                        }
                        catch (Exception ex)
                        {
                            outData.evt = "error";
                            outData.desc = ex.Message;
                        }
                    }

                    evtWaitScannerData.Reset();
                }
                else if (string.Equals(jsonObject.evt, "stopScanner", StringComparison.OrdinalIgnoreCase)) {

                    this.StopScanner();
                }                
            }
            catch (PosControlException ex)
            {
                outData.evt = "error";
                outData.desc = ex.ToString();
            }
            catch (Exception ex)
            {
                outData.evt = "error";
                outData.desc = ex.ToString();
            }

            return Newtonsoft.Json.JsonConvert.SerializeObject(outData, Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
        }

        #region Private Methods

        /// <summary>
        /// Starts the scanner.
        /// </summary>
        /// <param name="controller">a reference to the public API of the controller</param>
        /// <param name="name">The name of the scanner.</param>
        void StartScanner(string name)
        {
            if (s_objScanner == null || !s_objScanner.DeviceEnabled)
            {
                this.OpenScanner(name);
            }

            this.ClaimScanner(name);
        }

        /// <summary>
        /// Stops the scanner.
        /// </summary>
        /// <param name="controller">>a reference to the public API of the controller</param>
        void StopScanner()
        {
            this.ReleaseScanner();
        }

        /// <summary>
        /// Called when the scanner receives data input.
        /// </summary>
        /// <param name="sender">The sender of the event.</param>
        /// <param name="e">The <see cref="DataEventArgs" /> instance containing the event data.</param>
        /// <exception cref="System.NullReferenceException"></exception>
        void OnDataEvent(object sender, DataEventArgs e)
        {
            //Console.Out.WriteLine(e.Status);
            //Console.Out.WriteLine(Encoding.UTF8.GetString(s_objScanner.ScanDataLabel));
            //Console.Out.WriteLine(Encoding.UTF8.GetString(s_objScanner.ScanData));

            //Console.Out.WriteLine("Decode Data: %d", bDecodeData);
            //configuration dependent decoding (see description of called methods)!
            if (bDecodeData)
            {
                OnDataEventDecodeDataAutomatically();
            }
            else
            {
                OnDataEventDecodeDataProgrammatically();
            }
        }

        /// <summary>
        /// Use this method, if scanner's DecodeData=TRUE.
        /// In this case, the DECODED data are got from ScannerLabel,
        /// which is automatically filled dependent on ScanDataType.
        /// </summary>
        private void OnDataEventDecodeDataAutomatically()
        {
            try
            {
                if (s_objScanner == null)
                    throw new NullReferenceException();

                //throw exception in case of unknown barcode type
                if (s_objScanner.ScanDataType == Microsoft.PointOfService.BarCodeSymbology.Unknown)
                {
                    //the ENCODED result of the last scan (containing type letters)
                    string scannerDataWithType = Encoding.UTF8.GetString(s_objScanner.ScanData);

                    //write dummy data to return to GUI
                    scannerData = string.Empty;
                    for (int i = 0; i < scannerDataWithType.Length; i++)
                    {
                        scannerData += "*";
                    }
                }
                else
                    //get decoded data
                    scannerData = Encoding.UTF8.GetString(s_objScanner.ScanDataLabel);

                //configuration dependent action!
                if (bInternalBeep) Beep(1000, 1000);
            }
            catch (Exception)
            {
                scannerData = string.Empty;
            }
            finally
            {
                if ((s_objScanner != null) &&
                    (s_objScanner.Claimed))               // bugfix: #911010
                {
                    s_objScanner.ClearInput();
                }
                s_objScanner.DataEventEnabled = true;
                evtWaitScannerData.Set();
            }
        }

        /// <summary>
        /// Use this method, if scanner's DecodeData=FALSE.
        /// In this case, the DECODED data are got from (whole) ScanData,
        /// programmatically removing leading non-numeric characters (prefix) before using.
        /// </summary>
        private void OnDataEventDecodeDataProgrammatically()
        {
            try
            {
                if (s_objScanner == null)
                    throw new NullReferenceException();

                byte[] btScannerData = s_objScanner.ScanData;

                if ((btScannerData != null) &&
                    (btScannerData.Length > 0))
                {
                    scannerData = Encoding.UTF8.GetString(btScannerData);

                    for (int i = 0; i < scannerData.Length; i++)
                    {
                        if (char.IsNumber(scannerData[i]))
                        {
                            //remove all non-numeric characters (prefix)
                            scannerData = scannerData.Substring(i);
                            break;
                        }
                    }

                    //configuration dependent action!
                    if (bInternalBeep) Beep(1000, 1000);
                }
            }
            catch (Exception)
            {
                scannerData = string.Empty;
            }
            finally
            {
                if ((s_objScanner != null) &&
                    (s_objScanner.Claimed))               // bugfix: #911010
                {
                    s_objScanner.ClearInput();
                }
                s_objScanner.DataEventEnabled = true;
                evtWaitScannerData.Set();
            }
        }

        /// <summary>
        /// Called when the scanner caught an errornous situation.
        /// </summary>
        /// <param name="sender">The sender of the event.</param>
        /// <param name="e">The <see cref="DeviceErrorEventArgs" /> instance containing the event data.</param>
        void OnErrorEvent(object sender, DeviceErrorEventArgs e)
        {
            this.ReleaseScanner();
            this.ClaimScanner(s_objScanner.DeviceName);
        }

        /// <summary>
        /// Opens the scanner.
        /// </summary>
        /// <param name="name">The name of the scanner.</param>
        /// <exception cref="Microsoft.PointOfService.PosControlException"></exception>
        void OpenScanner(string name)
        {
            PosExplorer exp = new PosExplorer();

            foreach (DeviceInfo dev in exp.GetDevices(DeviceType.Scanner))
            {
                if (dev.LogicalNames.Contains<string>(name))
                {
                    s_objScanner = exp.CreateInstance(dev) as Scanner;
                    break;
                }
            }

            if (s_objScanner != null)
            {
                lock (s_objScanner)
                {
                    s_objScanner.ErrorEvent += new DeviceErrorEventHandler(OnErrorEvent);
                    s_objScanner.DataEvent += new DataEventHandler(OnDataEvent);

                    s_objScanner.Open();

                    //configuration dependent setting!
                    if (bDecodeData) s_objScanner.DecodeData = true;
                }

                scannerData = string.Empty;
                evtWaitScannerData.Reset();
            }
            else
            {
                throw new PosControlException(String.Format("The scanner {0} is not available!", name), ErrorCode.NoHardware);
            }
        }

        /// <summary>
        /// Claims the scanner.
        /// </summary>
        /// <param name="name">The name of the scanner.</param>
        /// <exception cref="Microsoft.PointOfService.PosControlException"></exception>
        void ClaimScanner(string name)
        {
            if (s_objScanner != null)
            {
                lock (s_objScanner)
                {
                    try
                    {
                        if (!s_objScanner.Claimed)
                        {
                            s_objScanner.Claim(5000);
                        }
                    }
                    catch (Exception)
                    {
                        throw new PosControlException("Scanner could not be claimed!", ErrorCode.NotClaimed);
                    }

                    if (s_objScanner.Claimed)               // bugfix: #911007
                    {
                        this.ClearScannerBuffer();

                        if (!s_objScanner.DeviceEnabled)
                            s_objScanner.DeviceEnabled = true;

                        if (!s_objScanner.DataEventEnabled)
                            s_objScanner.DataEventEnabled = true;
                    }
                    else
                    {
                        throw new PosControlException("Scanner could not be claimed!", ErrorCode.NotClaimed);
                    }
                }
            }
            else
            {
                throw new PosControlException(String.Format("The scanner {0} is not available!", name), ErrorCode.NoHardware);
            }
        }

        /// <summary>
        /// Closes the scanner.
        /// </summary>
        void CloseScanner()
        {
            if (s_objScanner != null)
            {
                lock (s_objScanner)
                {
                    if (s_objScanner.DataEventEnabled)
                    {
                        s_objScanner.DataEvent -= this.OnDataEvent;
                        s_objScanner.DataEventEnabled = false;
                    }

                    try
                    {
                        s_objScanner.Close();
                    }
                    catch (Exception)
                    { }
                }
            }

            s_objScanner = null;
            evtWaitScannerData.Set();
        }

        /// <summary>
        /// Releases the scanner.
        /// </summary>
        /// <exception cref="Microsoft.PointOfService.PosControlException"></exception>
        void ReleaseScanner()
        {
            if (s_objScanner != null)
            {
                lock (s_objScanner)
                {
                    try
                    {
                        if (s_objScanner.Claimed)               // bugfix: #911010
                        {
                            s_objScanner.ClearInput();
                            s_objScanner.DeviceEnabled = false;
                            s_objScanner.Release();
                        }
                    }
                    catch (Exception)
                    {
                        this.CloseScanner();                    // force closing scanner to re-open it later on
                        throw new PosControlException("The scanner is no longer available!", ErrorCode.Offline);
                    }
                }
            }
        }

        /// <summary>
        /// Clears the scanner buffer.
        /// </summary>
        void ClearScannerBuffer()
        {
            if ((s_objScanner == null) ||
                (!s_objScanner.Claimed))
                return;

            lock (s_objScanner)
            {
                try
                {
                    s_objScanner.ClearInput();
                    s_objScanner.DataEventEnabled = true;
                }
                catch (Exception)
                { }
            }

            scannerData = string.Empty;
            evtWaitScannerData.Reset();
        }

        #endregion
    }
}
