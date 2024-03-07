const mytoken = '123'; 
const MainData = ``;
const urls = ['https://allsub.king361.cf'];
const subconverter = "back.889876.xyz"; 
const subconfig = "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"; 

export default {
	async fetch (request) {
		const userAgent = (request.headers.get('User-Agent') || "null").toLowerCase();
		const url = new URL(request.url);
		const token = url.searchParams.get('token');

		// Token validation
		if (!(token == mytoken || url.pathname.includes("/"+ mytoken))) {
			return new Response('Invalid token???', { status: 403 });
		}

		let req_data = MainData;

		// Fetch responses from all subscription URLs concurrently
		const responses = await Promise.all(urls.map(url => fetch(url,{
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'User-Agent': 'worker/sub/mjjonone'
			}
		})));

		// Add content of successful responses to request data
		for (const response of responses) {
			if (response.ok) {
				const content = await response.text();
				req_data += atob(content) + '\n';
			}
		}

		const TARGETS = ['clash', 'sing-box', 'singbox', 'shadowrocket', 'quantumult'];
		const SUBTARGET_MAP = new Map([
		  ['clash', 'clash'],
		  ['sing-box', 'singbox'],
		  ['singbox', 'singbox'],
		  ['shadowrocket', 'clash'],
		  ['quantumult', 'clash']
		]);
		
		// Function to fetch converted subscription content
		async function fetchSubscriptionContent(target, request, subconverter, subconfig) {
		  const subTarget = SUBTARGET_MAP.get(target);
		  const subconverterUrl = `https://${subconverter}/sub?target=${subTarget}&url=${encodeURIComponent(request.url)}&insert=false&config=${encodeURIComponent(subconfig)}&emoji=true&list=false&tfo=false&scv=false&fdn=false&sort=false&new_name=true`;
		
		  const subconverterResponse = await fetch(subconverterUrl);
		
		  if (!subconverterResponse.ok) {
			throw new Error(`Error fetching subconverterUrl: ${subconverterResponse.status} ${subconverterResponse.statusText}`);
		  }
		
		  return await subconverterResponse.text();
		}
		
		// Fetch converted subscription content if User-Agent matches any target
		for (const target of TARGETS) {
		  if (userAgent.toLowerCase().includes(target)) {
			try {
			  const subconverterContent = await fetchSubscriptionContent(target, request, subconverter, subconfig);
			  
			  return new Response(subconverterContent, {
				headers: { 'content-type': 'text/plain; charset=utf-8' },
			  });
			} catch (error) {
			  console.error(error);
			}
		  }
		}		

		// Encode request data to base64 if no User-Agent matches
		const utf8Encoder = new TextEncoder();
		const encodedData = utf8Encoder.encode(req_data);
		const base64Data = btoa(String.fromCharCode.apply(null, encodedData));
		return new Response(base64Data);
	}
};
