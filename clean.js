const fs = require('fs');
const historyDir = __dirname + "/history";
const currentDir = __dirname + "/history/current";
const twitterDir = __dirname + "/twitter";
const backupDir = __dirname + "/twitter/backup";

removeDirectory(historyDir);
fs.mkdirSync(historyDir);
fs.mkdirSync(currentDir);
fs.writeFileSync(currentDir + "/.gitkeep", "");

removeDirectory(twitterDir);
fs.mkdirSync(twitterDir);
fs.mkdirSync(backupDir);
fs.writeFileSync(backupDir + "/.gitkeep", "");

function removeDirectory(path) {
	try {
		fs.readdirSync(path).forEach(function (file) {
			// fileがファイルの場合
			if (fs.statSync(path + "/" + file).isFile()) {
				// fileの削除
				fs.unlinkSync(path + "/" + file);

				// fileがディレクトリの場合
			} else {
				// ディレクトリの中身＋ディレクトリの削除
				removeDirectory(path + "/" + file);
			}
		});

		// ディレクトリの削除
		fs.rmdirSync(path);
	} catch (e) {
	}
}
