import { h, Component } from 'preact';
import style from './style.less';


export default class Update extends Component {
    constructor() {
        super();
    }

    render({ }, { }) {

        return (
            <div class={style.scanResults}>
                <form method='POST' action='/update' enctype='multipart/form-data'>
                    <input type='file' name='update' />
                    <input type='submit' value='Update' />
                </form>
            </div >
        );
    }
}