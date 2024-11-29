import express from 'express';
import * as http from 'http';
import * as bodyparser from 'body-parser';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors'
import {CommonRoutesConfig} from './common/common.routes.config';
import {UsersRoutes} from './users/users.routes.config';
import debug from 'debug';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 3000;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

debugLog('Initializing middleware');

debugLog('Configuring body-parser');
app.use(bodyparser.json());
debugLog('Body-parser configured');

debugLog('Configuring CORS');
app.use(cors());
debugLog('CORS configured');

debugLog('Configuring Winston logger');
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));
debugLog('Winston logger configured');

debugLog('Configuring authorization middleware');
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    debugLog('Checking authorization header');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        debugLog('No authorization header found - returning 401');
        return res.status(401).send({ error: 'No authorization header' });
    }
    debugLog('Authorization header found - proceeding');
    next();
});
debugLog('Authorization middleware configured');

debugLog('Adding routes');
routes.push(new UsersRoutes(app));
debugLog('Routes added');

debugLog('Configuring Winston error logger');
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));
debugLog('Winston error logger configured');

debugLog('Configuring root endpoint');
app.get('/', (req: express.Request, res: express.Response) => {
    debugLog('Root endpoint accessed');
    res.status(200).send(`Server running at http://localhost:${port}`);
    debugLog('Root endpoint response sent');
});

debugLog(`Starting server on port ${port}`);
server.listen(port, () => {
    debugLog(`Server running at http://localhost:${port}`);
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
});