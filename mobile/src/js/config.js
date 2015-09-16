define(['underscore'],
        function(_) {

            var Config = {

                applicationName: "Easy Dinner",
                serverUrl: "http://localhost:3000",
                sendWelcomePost: true,
                knownUnits: ['mg', 'g', 'kg', 'ml', 'l', 'EL', 'TL', 'Kasten', 'Flasche', 'Flaschen']
            };
            return Config;
        });
