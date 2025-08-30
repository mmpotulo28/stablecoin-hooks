const fs = require("fs");
const path = require("path");

const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const [major, minor, patch] = pkg.version.split(".").map(Number);

if (patch < 9) {
	pkg.version = [major, minor, patch + 1].join(".");
} else if (minor < 9) {
	pkg.version = [major, minor + 1, 0].join(".");
} else {
	pkg.version = [major + 1, 0, 0].join(".");
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`Version bumped to ${pkg.version}`);
