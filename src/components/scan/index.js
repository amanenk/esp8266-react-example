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
	xmlHttp.send(null);
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
			console.log(`result ${result}`);
			let data = JSON.parse(result);
			if (data)
				self.setState({ mac: data.sta_mac });
		})
	}

	scanWiFi = () => {
		let self = this;
		httpGetAsync(`/${this.state.mac}/api/wifi/scan`, function (result) {
			console.log(`result ${result}`);
			let data = JSON.parse(result);
			if (data)
				self.setState({ scanResult: data });
		})
	}

	// gets called when this route is navigated to
	componentDidMount() {
		this.getMac();
		this.scanWiFi();
	}

	// gets called just before navigating away from the route
	componentWillUnmount() {
		clearInterval(this.timer);
	}

	handleClick(ap) {
		console.log("ssid click");
		this.state.modalData = ap.ssid
		this.handleToggleModal();
	}

	handleToggleModal() {
		this.setState({ showModal: !this.state.showModal });
		console.log(` show modal: ${this.state.showModal}`)
	}

	doConnect(ssid) {
		// console.log(this.state.password);
		console.log("try to connect");
		this.setState({ connecting: true });
		httpPutAsync(`/${this.state.mac}/api/wifi/scan`, {
			ssid: ssid,
			password: this.state.password
		}, function () {
			this.setState({ connecting: false });
			console.log("response result")
		})
	}

	render({ connecting }) {
		const { showModal, modalData, scanResult } = this.state;

		return (

			<div class={style.scanResults}>



				<ul>
					{scanResult.map(ap => (
						<button class={buttonStyle.btn} onClick={() => { this.handleClick(ap) }}>
							{ap.name}
						</button>
					))}
				</ul>





				<ModalDialog show={showModal} onCloseRequest={() => this.handleToggleModal()}>
					<p>please enter the password for {modalData.ssid}</p>
					<input onChange={(event) => this.state.password = event.target.value} id="userPassword" type="password"></input>
					<button onClick={() => this.doConnect(modalData.ssid)} class={buttonStyle.btn}>
						Connect
					</button>
				</ModalDialog>

			</div >
		);
	}
}
