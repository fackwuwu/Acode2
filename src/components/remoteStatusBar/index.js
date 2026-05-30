import "./style.scss";
import select from "dialogs/select";
import helpers from "utils/helpers";

/**@type {HTMLElement | null} */
let $el = null;
let currentRemote = null;

function render(remoteName) {
	if (!$el) {
		$el = (
			<div className="remote-status-bar" onclick={handleClick}>
				<span className="icon remote"></span>
				<span className="text"></span>
			</div>
		);
		const $app = document.getElementById("app") || document.body;
		$app.appendChild($el);
	}

	const $text = $el.querySelector(".text");
	if (remoteName) {
		$el.classList.remove("disconnected");
		$text.textContent = `SSH: ${remoteName}`;
		$el.style.display = "flex";
	} else {
		$el.classList.add("disconnected");
		$el.style.display = "none";
	}
}

async function handleClick() {
	const options = [
		["close", strings.close, "folder-remove"],
		[
			"terminal",
			strings["open in terminal"] || "Open in Terminal",
			"licons terminal",
		],
	];

	const option = await select(currentRemote, options);
	switch (option) {
		case "close": {
			const openFolder = (await import("lib/openFolder")).default;
			const remoteFolders = (await import("lib/openFolder")).addedFolder.filter(
				(f) => f.url.startsWith("sftp:"),
			);
			for (const folder of remoteFolders) {
				folder.remove();
			}
			break;
		}
		case "terminal": {
			const openFolder = (await import("lib/openFolder")).default;
			const remoteFolder = (await import("lib/openFolder")).addedFolder.find(
				(f) => f.url.startsWith("sftp:"),
			);
			if (remoteFolder) {
				const { TerminalManager } = await import("components/terminal");
				const URLParse = (await import("url-parse")).default;
				const { hostname, port, username, password, query } = URLParse(
					remoteFolder.url,
					true,
				);
				const { keyFile, passPhrase } = query;

				await TerminalManager.createSshTerminal({
					host: hostname,
					port: port || 22,
					username: decodeURIComponent(username),
					password: decodeURIComponent(password || ""),
					keyFile: decodeURIComponent(keyFile || ""),
					passPhrase: decodeURIComponent(passPhrase || ""),
					name: remoteFolder.title,
				});
			}
			break;
		}
	}
}

export default {
	update(remoteName) {
		currentRemote = remoteName;
		render(remoteName);
	},
	get current() {
		return currentRemote;
	},
};
