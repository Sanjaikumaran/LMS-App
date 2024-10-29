const os = require("os");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");
function detectOS() {
  const platform = os.platform();
  if (platform === "win32") {
    return {
      name: "windows",
      url:
        "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.3.zip",
    };
  } else if (platform === "darwin") {
    return {
      name: "mac",
      url:
        "https://downloads.mongodb.com/osx/mongodb-macos-x86_64-2022.11.22.00.00.00.tgz",
    };
  } else if (platform === "linux") {
    return {
      name: "linux",
      url:
        "https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-amazon2023-8.0.3.tgz",
    };
  } else {
    throw new Error("Unsupported OS");
  }
}
async function downloadMongoDB(osInfo) {
  const filePath = path.join(__dirname, `mongodb-${osInfo.name}.tgz`);
  if (os.platform() === "win32") {
    const filePath = path.join(__dirname, `mongodb-${osInfo.name}.zip`);
  }
  const response = await axios({
    url: osInfo.url,
    method: "GET",
    responseType: "stream",
  });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
function installMongoDB(osInfo) {
  if (osInfo.name === "windows") {
    exec(`start ${path.join(__dirname, "mongodb-windows.zip")}`, (error) => {
      if (error) {
        console.error(`Error opening installer: ${error}`);
      }
    });
  } else if (osInfo.name === "mac") {
    exec(
      `tar -xvzf ${path.join(__dirname, "mongodb-macos.tgz")} -C /usr/local`,
      (error) => {
        if (error) {
          console.error(`Error installing MongoDB: ${error}`);
        }
      }
    );
  } else if (osInfo.name === "linux") {
    exec(
      `sudo tar -xvzf ${path.join(
        __dirname,
        "mongodb-linux.tgz"
      )} -C /usr/local`,
      (error) => {
        if (error) {
          console.error(`Error installing MongoDB: ${error}`);
        }
      }
    );
  }
}
function getConnectionString() {
  return "mongodb://localhost:27017";
}
async function main() {
  try {
    const osInfo = detectOS();
    console.log(`Detected OS: ${osInfo.name}`);
    console.log("Downloading MongoDB...");
    await downloadMongoDB(osInfo);
    console.log("Download complete.");
    console.log("Installing MongoDB...");
    installMongoDB(osInfo);
    console.log("MongoDB installation initiated.");
    const connectionString = getConnectionString();
    console.log(`MongoDB Connection String: ${connectionString}`);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}
main();
