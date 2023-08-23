# Laboratory-System-Backend

<div align="center">

[![API Test](https://github.com/RealEskalate/Laboratory-System/actions/workflows/api.test.yml/badge.svg)](https://github.com/RealEskalate/Laboratory-System/actions/workflows/api.test.yml)

[![API Prod](https://github.com/RealEskalate/Laboratory-System/actions/workflows/api.heroku-deploy.yml/badge.svg)](https://github.com/RealEskalate/Laboratory-System/actions/workflows/api.heroku-deploy.yml)

</div>

<br />


Load testing with autocannon to check performance of our backend
run
```bash
npx autocannon -c 600 -d 5 -p 10 <http://localhost:PORT> 
```
