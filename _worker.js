// Define constants including token, main data, subscription URLs, subscription backend converter, and subscription configuration file
const mytoken = '123'; 
const MainData = ``;
const urls = ['https://allsub.king361.cf'];
const subconverter = "back.889876.xyz"; 
const subconfig = "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"; 

export default {
	// Define an asynchronous fetch function to handle requests
	async fetch (request) {
		// Get the User-Agent information from the request header and convert it to lowercase
		const userAgent = (request.headers.get('User-Agent') || "null").toLowerCase();
		
		// Get the token from the request URL
		const url = new URL(request.url);
		const token = url.searchParams.get('token');

		// Check if the token is valid
		if (!(token == mytoken || url.pathname.includes("/"+ mytoken))) {
			return new Response('Invalid token???', { status: 403 });
		}

		// Initialize the request data and add the main data
		let req_data = MainData;

		// Parallelly get the responses from all subscription URLs
		const responses = await Promise.all(urls.map(url => fetch(url,{
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		})));

		// Iterate through the responses, if the response is normal, decode the content and add it to the request data
		for (const response of responses) {
			if (response.ok) {
				const content = await response.text();
				req_data += atob(content) + '\n';
			}
		}

		// Check if the User-Agent contains specific targets, if so, get the converted subscription content and return
		const targets = ['clash', 'sing-box', 'singbox', 'Shadowrocket', 'Quantumult'];
		for (const target of targets) {
			if (userAgent.includes(target)) {
				const subTarget = ['clash', 'Shadowrocket', 'Quantumult'].includes(target) ? 'clash' : 'singbox';
				const subconverterUrl = `https://${subconverter}/sub?target=${subTarget}&url=${encodeURIComponent(request.url)}&insert=false&config=${encodeURIComponent(subconfig)}&emoji=true&list=false&tfo=false&scv=false&fdn=false&sort=false&new_name=true`;

				try {
					const subconverterResponse = await fetch(subconverterUrl);
					
					if (!subconverterResponse.ok) {
						throw new Error(`Error fetching subconverterUrl: ${subconverterResponse.status} ${subconverterResponse.statusText}`);
					}
					
					const subconverterContent = await subconverterResponse.text();
					
					return new Response(subconverterContent, {
						headers: { 'content-type': 'text/plain; charset=utf-8' },
					});
				} catch (error) {
					return new Response(`Error: ${error.message}`, {
						status: 500,
						headers: { 'content-type': 'text/plain; charset=utf-8' },
					});
				}
			}
		}

		// If no User-Agent matches, encode the request data to base64 and return
		const utf8Encoder = new TextEncoder();
		const encodedData = utf8Encoder.encode(req_data);
		const base64Data = btoa(String.fromCharCode.apply(null, encodedData));
		return new Response(base64Data);
	}
};
