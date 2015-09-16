using SuperSocket.SocketBase;
using System;
using TPDotnet.Enterprise.Common.Desktop.Clients.SilverlightClientHelper;

namespace SuperWebSocket.Samples.BasicConsole
{
    class Program
    {
        static ScannerRequestHandler scanReqHandler = new ScannerRequestHandler();

        static void Main(string[] args)
        {
            Console.WriteLine("About to start the WebSocketServer!");
          
            var appServer = new WebSocketServer();

            //Setup the appServer
            if (!appServer.Setup(4510)) //Setup with listening port
            {
                Console.WriteLine("Failed to setup!");
                Console.ReadKey();
                return;
            }

            appServer.NewMessageReceived += new SessionHandler<WebSocketSession, string>(appServer_NewMessageReceived);

            Console.WriteLine();

            //Try to start the appServer
            if (!appServer.Start())
            {
                Console.WriteLine("Failed to start!");
                Console.ReadKey();
                return;
            }

            Console.WriteLine("The server started successfully, press key 'q' to stop it!");

            while (Console.ReadKey().KeyChar != 'q')
            {
                Console.WriteLine();
                continue;
            }

            //Stop the appServer
            appServer.Stop();

            Console.WriteLine();
            Console.WriteLine("The server was stopped!");
            Console.ReadKey();
        }

        static void appServer_NewMessageReceived(WebSocketSession session, string message)
        {
            Console.Out.WriteLine("Message received: " + message);

            string result = scanReqHandler.HandleRequest(message);

            if (message != "{\"evt\":\"stopScanner\"}") {
				Console.Out.WriteLine("Response to be sent: " + result);
				//Send the received message back
				session.Send(result);
            } else {
				Console.Out.WriteLine("not sending response for stopScanner");
			}
        }
    }
}
