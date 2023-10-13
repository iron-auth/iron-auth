/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	swcMinify: true,
	transpilePackages: [
		'@iron-auth/react',
		'iron-auth',
		'@iron-auth/kysely-adapter',
		'@libs/test-utils',
	],
	experimental: {
		// runtime: 'experimental-edge',
		// appDir: true,
	},
};

module.exports = config;
