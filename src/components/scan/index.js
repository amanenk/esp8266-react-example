import { h, Component } from 'preact';
import style from './style.less';
import buttonStyle from './button.less';
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
	state = {
		mac: "",
		scanResult: [],
		showModal: false,
		modalData: {}
	};

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
					setInterval(self.getStatus, 5000);
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

	getStatus = () => {
		let self = this;
		httpGetAsync(`/${this.state.mac}/api/wifi/status`, function (result) {
			console.log(`result ${result}`);
			try {
				let data = JSON.parse(result);
				if (data)
					self.setState({ deviceStatus: data });
			} catch (error) {
				console.log("failed to status");
			}
		})
	}

	scanWiFi = () => {
		let self = this;
		httpGetAsync(`/${this.state.mac}/api/wifi/scan`, function (result) {
			console.log(`result ${result}`);
			try {
				let data = JSON.parse(result);
				if (data)
					self.setState({ scanResult: data });
			} catch (error) {
				console.log("failed to parse scan");
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
		clearInterval(this.timer);
	}

	handleClick(ap) {
		console.log("ssid click");
		this.setState({ modalData: ap });
		this.handleToggleModal();
	}

	handleToggleModal() {
		this.setState({ showModal: !this.state.showModal });
		console.log(` show modal: ${this.state.showModal}`)
	}

	doConnect(ssid) {
		// console.log(this.state.password);
		console.log("try to connect");

		this.setState({connecting: true, deviceStatus: null});

		httpPutAsync(`/${this.state.mac}/api/wifi/connect`, {
			ssid: ssid,
			password: this.state.password
		}, function (result) {
			console.log("response result:", result)
		})
	}

	render({ }, { noMac, showModal, modalData, scanResult, deviceStatus, connecting }) {
		console.log("no mac is:", noMac);

		if (deviceStatus != undefined && deviceStatus.wifi_status && connecting) {
			this.setState({ showModal: false, connecting: false });
		}

		return (
			<div class={style.scanResults}>
				{noMac ? <div><h1> No Mac Loaded</h1></div> : null}

				{deviceStatus != undefined ? <div>
					Status: {deviceStatus.wifi_status ? `Conndected. AP: ${deviceStatus.ap_ssid} IP: ${deviceStatus.ip}` : "Not Connected"}
				</div> : null}

				<ul>
					{scanResult.map(ap => (
						<button class={buttonStyle.btn} onClick={() => { this.handleClick(ap) }}>
							{ap.ssid}
						</button>
					))}
				</ul>


				{showModal ? <ModalDialog show={showModal} onCloseRequest={() => this.handleToggleModal()}>
					<p>please enter the password for {modalData.ssid}</p>
					<input onChange={(event) => this.state.password = event.target.value} id="userPassword" type="password"></input>
					<button onClick={() => this.doConnect(modalData.ssid)} class={buttonStyle.btn}>
						Connect
					</button>
				</ModalDialog> : null}

			</div >
		);
	}
}
