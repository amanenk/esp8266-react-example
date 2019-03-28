import { h, Component } from 'preact';
import style from './style.less';

export default class ModalDialog extends Component {
	componentDidMount() {
		// window.addEventListener("keyup", this.handleKeyUp, false);
		console.log("event subscribe");
		document.addEventListener("click", this.handleOutsideClick, false);
	}

	componentWillUnmount() {
		console.log("event UN-subscribe");
		// window.removeEventListener("keyup", this.handleKeyUp, false);
		document.removeEventListener("click", this.handleOutsideClick, false);
	}

	// handleKeyUp(e) {
	// 	const { onCloseRequest } = this.props;
	// 	const keys = {
	// 		27: () => {
	// 			e.preventDefault();
	// 			onCloseRequest();
	// 			window.removeEventListener("keyup", this.handleKeyUp, false);
	// 		}
	// 	};

	// 	if (keys[e.keyCode]) {
	// 		keys[e.keyCode]();
	// 	}
	// }

	handleOutsideClick(e) {
		console.log("click event")
		if (this.modal != undefined) {
			console.log("modal is defined");
			if (!this.modal.contains(e.target)) {
				const { onCloseRequest } = this.props;
				console.log("press in outsizde the modal")
				onCloseRequest();
				document.removeEventListener("click", this.handleOutsideClick, false);
			}
		} else {
			console.log("modal is undefined");
		}
	}

	render() {
		if (!this.props.show) {
			console.log("nothing to show");
			return null;
		}

		// this.handleOutsideClick = this.handleOutsideClick.bind(this);
		const { onCloseRequest, children } = this.props;

		return (
			<div class={style.modalOverlay}>
				<div class={style.modal} ref={(node) => {
					this.modal = node;
					console.log("setting the modal");
				}}>
					<div class={style.modalContent}>
						{children}
					</div>
				</div>

				<button
					type="button"
					className={style.closeButton}
					onClick={onCloseRequest}
				/>
			</div>
		);
	}
}
