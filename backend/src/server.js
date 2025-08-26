import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDB } from './db.js';
import { CONFIG } from './config.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import outfitRoutes from './routes/outfits.js';

const app = express();

app.use(helmet());
app.use(cors(
    {
        origin: CONFIG.CORS_ORIGIN,
        credentials: true
    }
));
app.use(morgan('dev'));
app.use(express.json({limit: '1mb'}));
app.use(cookieParser());

const limiter = rateLimit({windowMs: 15*60*1000, max:200});
app.use(limiter);

app.get('/health', (_,res)=>res.json({ok:true}));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/outfits', outfitRoutes);

await connectDB();
app.listen(CONFIG.PORT, () => {
    console.log(`Server listening on port ${CONFIG.PORT}`);
})