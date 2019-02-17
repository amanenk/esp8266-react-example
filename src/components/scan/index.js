import { h, Component } from 'preact';

// import { Button } from 'preact-material-components';
// import 'preact-material-components/Button/style.css';
// import {
// 	MdSignalWifi4BarLock,
// 	MdSignalWifi4Bar,
// 	MdSignalWifi3BarLock,
// 	MdSignalWifi3Bar,
// 	MdSignalWifi2BarLock,
// 	MdSignalWifi2Bar,
// 	MdSignalWifi1BarLock,
// 	MdSignalWifi1Bar,
// 	MdSignalWifi0Bar
// } from 'react-icons/md';


import buttonStyle from './button.less';
import style from './style.less';
import ModalDialog from '../modal';

function httpGetAsync(theUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	xmlHttp.send(null);
}

function httpPutAsync(theUrl, data, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("PUT", theUrl, true); // true for asynchronous 
	xmlHttp.send(JSON.stringify(data));
}

export default class Scan extends Component {
	constructor() {
		super();

		this.state.mac = "";
		this.state.scanResult = [];
		this.state.showModal = false;
		this.state.modalData = {};
	}

	getMac = () => {
		let self = this;
		httpGetAsync("/api/wifi/mac", function (result) {
			console.log(`get mac result ${result}`);
			try {
				let data = JSON.parse(result);
				// let data = { sta_mac: "test:123:123" };
				if (data && data.sta_mac) {
					console.log("mac data present");
					self.setState({ mac: data.sta_mac, noMac: false });
					console.log("state updated");
					self.scanWiFi();
					// Active
					window.onfocus = self.startStatusTimer;
					// Inactive
					window.onblur = self.stopStatusTimer;
					self.startStatusTimer();
				} else {
					throw new Error();
				}
			} catch (error) {
				console.log("error")
				console.log(error.stack)
				self.setState({ noMac: true });
			}
		})
	}

	startStatusTimer = () => {
		console.log("start timer")
		if (this.timer != undefined) {
			this.stopStatusTimer();
		}
		if (!this.state.noMac)
			this.timer = setInterval(this.getStatus, 6000);
		else
			console.log("no mac to do getstatus")
	}

	stopStatusTimer = () => {
		console.log("stop timer")
		clearInterval(this.timer);
		delete this.timer;
	}

	getStatus = () => {
		console.log("get status");
		let self = this;
		httpGetAsync(`/${this.state.mac}/api/wifi/status`, function (result) {
			console.log(`get status result ${result}`);
			try {
				let data = JSON.parse(result);
				if (data)
					self.setState({ deviceStatus: data });
			} catch (error) {
				console.log("failed to get status");
			}
		})
	}

	scanWiFi = () => {
		let self = this;
		self.setState({ scanning: true });
		httpGetAsync(`/${this.state.mac}/api/wifi/scan`, function (result) {
			console.log(`result ${result}`);
			try {
				let data = JSON.parse(result);
				if (data)
					self.setState({ scanResult: data, scanning: false });
			} catch (error) {
				console.log("failed to parse scan");
				self.setState({ scanning: false });
			}
		})
	}

	// gets called when this route is navigated to
	componentDidMount() {
		console.log("making mac request")
		this.getMac();
	}



	// gets called just before navigating away from the route
	componentWillUnmount() {
		this.stopStatusTimer();
	}

	handleClick(ap) {
		console.log("ssid click");
		if (ap.authmode == "wpa2_psk") {
			this.setState({ modalData: ap });
			this.handleToggleModal();
		} else {
			this.state.password = "";
			this.doConnect(ap.ssid);
		}

	}

	handleToggleModal() {
		this.setState({ showModal: !this.state.showModal });
		console.log(` show modal: ${this.state.showModal}`)
	}

	doConnect(ssid) {
		console.log(this.state.password);
		console.log("try to connect", {
			ssid: ssid,
			password: this.state.password
		});

		this.setState({ connecting: true, deviceStatus: null });

		httpPutAsync(`/${this.state.mac}/api/wifi/connect`, {
			ssid: ssid,
			password: this.state.password
		}, function (result) {
			console.log("response result:", result)
		})
	}

	render({ }, { noMac, showModal, modalData, scanResult, deviceStatus, connecting, scanning }) {
		if (deviceStatus != undefined && deviceStatus.network_status && connecting) {
			this.setState({ showModal: false, connecting: false });
		}



		var status = null;
		if (noMac) {
			console.log("mac is not loaded");
			status = <h1> No Mac Loaded</h1>;
		} else if (scanResult.length == 0) {
			console.log("there is no acces points found");
			if (scanning) {
				console.log("scanninsg now");
				status = <p>Scaning...</p>;
			} else {
				status = <button
					class={buttonStyle.btn}
					style={{ alignSelf: "center", marginTop: 2, width: "20%" }}
					onClick={() => { this.scanWiFi() }}>
					Scan
				</button>
			}
		} else if (deviceStatus != undefined) {
			console.log("need to show status");
			status = <p>Status: {deviceStatus.network_status ? `Connected. AP: ${deviceStatus.ap_ssid} IP: ${deviceStatus.ip}` : "Not Connected"}</p>;
		}

		return (
			<div class={style.scanResults}>

				{status != "" ? <div> {status} </div> : null}

				<ul>
					{scanResult.map(ap => {
						// let signal_icon = <MdSignalWifi0Bar />;
						let psk = ap.authmode == "wpa2_psk";

						//maybe in future will be used signal icons
						// if (ap.rssi > -40) {
						// 	signal_icon = psk ? <MdSignalWifi4BarLock /> : <MdSignalWifi4Bar />;
						// } else if (ap.rssi > -55) {
						// 	signal_icon = psk ? <MdSignalWifi3BarLock /> : <MdSignalWifi3Bar />;
						// } else if (ap.rssi > -65) {
						// 	signal_icon = psk ? <MdSignalWifi2BarLock /> : <MdSignalWifi2Bar />;
						// } else if (ap.rssi > -80) {
						// 	signal_icon = psk ? <MdSignalWifi1BarLock /> : <MdSignalWifi1Bar />;
						// }

						//lock icon svg
						let network_icon = psk ? <svg style={{ height: "25px", position: "absolute", right: "0.2em", top: "0.2em" }} viewBox="0 0 24 24">
							<path d="m3,9v11h14V9M4,9V6c0-3.3 2.7-6 6-6c3.3,0 6,2.7 6,6v3H14V6c0-2.2-1.8-4-4-4-2.2,0-4,1.8-4,4v3" />
						</svg> : null

						return (
							<button
								class={buttonStyle.btn}
								onClick={() => { this.handleClick(ap) }}>
								{ap.ssid}
								{network_icon}
							</button>
						)

					})}
				</ul>

				{
					showModal ? <ModalDialog show={showModal} onCloseRequest={() => this.handleToggleModal()}>
						<p>please enter the password for {modalData.ssid}</p>
						<input onChange={(event) => this.state.password = event.target.value} id="userPassword" type="password"></input>
						<button
							class={buttonStyle.btn}
							onClick={() => this.doConnect(modalData.ssid)}
							style={{ width: "35%" }}
						>
							Connect
					</button>
					</ModalDialog> : null
				}

			</div >
		);
	}
}