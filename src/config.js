const dev = process.env.NODE_ENV === 'development';

export const websocketProtocol = dev ? "ws" : "wss";
export const serverBaseUrl = dev ? 'localhost:8888' : 'tobias-reinke.de/shotclock';