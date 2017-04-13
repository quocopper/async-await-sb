function resolveAfterInterval(x,t) {
 return new Promise(resolve => {
  setTimeout(() => {
   resolve(x * x);
  }, t * 1000);
 });
}

async function distance1(x) {
 var a = resolveAfterInterval(20,2);
 var b = resolveAfterInterval(30,3);
 return Math.sqrt(Math.pow(x,2) + Math.pow(await a,2) + Math.pow(await b,2));
	// return Math.sqrt(Math.pow(x,2) + Math.pow(a,2) + Math.pow(b,2)); 
	// Returns NaN since it doesn't wait for helper method to return.
}

distance1(10).then((v)=>console.log(v))
