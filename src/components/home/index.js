import { h } from 'preact';
import style from './style.less';

import { Link } from 'preact-router';

export default () => {
	return (
		<div class={style.home}>
			<h1>Home</h1>
			<p>This is the Home component.</p>

			<p>you need to connect the device to AP press scann on the top of the page</p>
			<Link href="/scan">scan</Link>
		</div>
	);
};
