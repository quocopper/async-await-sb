function resolveAfterInterval(x,t) {
 return new Promise(resolve => {
  setTimeout(() => {
      // Do something in preparation
      x = 1;
   resolve(x * x);
  }, t * 1000);
 });
}

async function distance3D(x) {
 var a = resolveAfterInterval(20,2);
 var b = resolveAfterInterval(30,3);
 return Math.sqrt(Math.pow(x,2) + Math.pow(await a,2) + Math.pow(await b,2));
	// return Math.sqrt(Math.pow(x,2) + Math.pow(a,2) + Math.pow(b,2)); 
	// Above comment returns NaN since it doesn't wait for helper method to return.
}

distance3D(1).then(
    (v)=>console.log(v)
);
