export const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
export const getRGBColor = (color) => {
	if (color[0] === "#") {
		const r = parseInt(color.substring(1, 3), 16);
		const g = parseInt(color.substring(3, 5), 16);
		const b = parseInt(color.substring(5, 7), 16);
		return `${r}, ${g}, ${b}`;
	}
	return color;
};
export const fetchAsync = async (url, method = "GET", data = {}) => {
	const init = {
		method: method,
	};
	if (method === "POST" || method === "PUT") {
		init.headers = { "Content-Type": "application/json" };
		init.body = JSON.stringify(data);
	}
	const response = await fetch(url, init);
	return await response.json();
};
