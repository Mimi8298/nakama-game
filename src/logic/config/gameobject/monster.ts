import MovementConfig from "../component/movement";
import RenderConfig from "../component/render";
import Config from "../config";

export default interface MonsterConfig extends Config {
    movement: MovementConfig;
    render: RenderConfig;
}