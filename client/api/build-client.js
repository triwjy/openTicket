// function to take incoming request along with headers
// and build pre-configured version of axios that works
// on any environments (browser or server)
import axios from "axios";

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on server

    return axios.create({
        // for dev:
        // baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local', 
        baseURL: 'http://www.triwjy.xyz', 
        headers: req.headers
      });
  } else {
    // we are on browser
    return axios.create({
      baseURL: '/'
    });
  }
};
