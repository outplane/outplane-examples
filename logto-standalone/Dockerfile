FROM svhd/logto:latest
ENTRYPOINT ["sh", "-c", "\
  echo 'Waiting for PostgreSQL...' && \
  while ! node -e \"const net=require('net');const s=new net.Socket();s.setTimeout(2000);s.connect(parseInt(new URL(process.env.DB_URL).port||5432),new URL(process.env.DB_URL).hostname,()=>{s.destroy();process.exit(0)});s.on('error',()=>{process.exit(1)});s.on('timeout',()=>{s.destroy();process.exit(1)})\" 2>/dev/null; do \
    sleep 2; \
  done && \
  echo 'PostgreSQL is ready' && \
  npm run cli db seed -- --swe && \
  npm run cli db alt deploy && \
  npm start"]
