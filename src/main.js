/**
 * main.js
 * 应用入口：初始化并启动游戏。
 */
import { Game } from './Game.js';

const container = document.getElementById('app');
const game = new Game(container);

game.start();
