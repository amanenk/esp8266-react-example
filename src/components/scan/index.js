import { h, Component } from 'preact';
import style from './style.less';
import ModalDialog from '../modal'

function httpGetAsync(theUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	xmlHttp.send(null);
}

export default class Scan extends Component {
	state = {
		events: [],
		showModal: false,
		modalData: {}
	};

	scanWiFi = () => {
		let self = this;
		httpGetAsync("https://jsonplaceholder.typicode.com/users", function (result) {
			// console.log(result);
			let data = JSON.parse(result);
			self.setState({ events: data });
		})
	}

	// gets called when this route is navigated to
	componentDidMount() {
		this.scanWiFi();
	}

	// gets called just before navigating away from the route
	componentWillUnmount() {
		clearInterval(this.timer);
	}

	handleClick(event) {
		console.log("ssid click");
		this.handleToggleModal();
	}

	handleToggleModal() {
		this.setState({ showModal: !this.state.showModal });
		console.log(` show modal: ${this.state.showModal}`)
	}

	doConnect() {
		// console.log(this.state.password);
		console.log("try to connect");
	}

	// Note: `user` comes from the URL, courtesy of our router
	render({ user }, { events }) {
		const { showModal, modalData } = this.state;

		return (
			<div class={style.scanResults}>
				<h1>Scan results: {user}</h1>
				<ul>
					{events.map(event => (
						<div onClick={() => { this.handleClick(event) }} class={style.scanItem}>
							<h1 class={style.name}>{event.name}</h1>
						</div>
					))}
				</ul>

				<ModalDialog show={showModal} onCloseRequest={() => this.handleToggleModal()}>
					<p>please enter the password for {modalData.ssid}</p>
					<input onChange={(event) => this.state.password = event.target.value} id="userPassword" type="password"></input>
					<div onClick={this.doConnect} class={style.connect}>Connect</div>
				</ModalDialog>
			</div>
		);
	}
}
