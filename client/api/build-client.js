// function to take incoming request along with headers
// and build pre-configured version of axios that works
// on any environments (browser or server)
import axios from "axios";

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // on server

    return axios.create({
        baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local', 
        // on prod:
        // baseURL: 'http://www.triwjy.xyz', 
        headers: req.headers
      });
  } else {
    // on browser
    return axios.create({
      baseURL: '/'
    });
  }
};
