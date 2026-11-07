// Farming System: Rice Paddy Plots, Planting, Growing, Watering, Harvesting

import { state } from './state.js';
import { sound } from './audio.js';

export class FarmingManager {
    constructor() {
        this.plotLayouts = [
            { id: 0, x: 570, y: 790, w: 150, h: 95 },
            { id: 1, x: 740, y: 790, w: 150, h: 95 },
            { id: 2, x: 910, y: 790, w: 150, h: 95 },
            { id: 3, x: 570, y: 910, w: 150, h: 95 },
            { id: 4, x: 740, y: 910, w: 150, h: 95 },
            { id: 5, x: 910, y: 910, w: 150, h: 95 }
        ];

        this.cropConfig = {
            rice: {
                name: 'Lúa Nếp Hoa Vàng',
                icon: '🌾',
                duration: 15000, // 15 seconds
                goldReward: 1200,
                expReward: 180,
                itemYield: { name: 'Hạt giống lúa nếp thần', cat: 'Vật Phẩm', count: 2, icon: '🌾', desc: 'Lúa nếp thu hoạch tươi mới.' }
            },
            corn: {
                name: 'Bắp Ngọt Hoàng Kim',
                icon: '🌽',
                duration: 20000,
                goldReward: 1800,
                expReward: 260,
                itemYield: { name: 'Hạt giống bắp ngọt', cat: 'Vật Phẩm', count: 3, icon: '🌽', desc: 'Bắp ngọt thơm nức mũi.' }
            },
            herb: {
                name: 'Tiên Thảo Trị Liệu',
                icon: '🌿',
                duration: 25000,
                goldReward: 2500,
                expReward: 380,
                diamondReward: 5,
                itemYield: { name: 'Cỏ thơm tiên thảo', cat: 'Vật Phẩm', count: 2, icon: '🌿', desc: 'Thảo mộc quý chữa lành bách bệnh.' }
            }
        };
    }

    update(dt) {
        const now = Date.now();
        state.data.farmPlots.forEach(plot => {
            if (plot.status === 'growing') {
                const elapsed = now - plot.plantTime;
                if (elapsed >= plot.growDuration) {
                    plot.status = 'ready';
                    state.save();
                }
            }
        });
    }

    getPlotAt(worldX, worldY) {
        for (const layout of this.plotLayouts) {
            if (
                worldX >= layout.x &&
                worldX <= layout.x + layout.w &&
                worldY >= layout.y &&
                worldY <= layout.y + layout.h
            ) {
                return state.data.farmPlots.find(p => p.id === layout.id) || null;
            }
        }
        return null;
    }

    plant(plotId, cropType = 'rice') {
        const plot = state.data.farmPlots.find(p => p.id === plotId);
        if (!plot || plot.status !== 'empty') return false;

        const config = this.cropConfig[cropType] || this.cropConfig.rice;
        plot.status = 'growing';
        plot.crop = cropType;
        plot.plantTime = Date.now();
        plot.growDuration = config.duration;
        plot.watered = true;

        sound.playTrap(); // soft soil rustle
        state.progressQuest('plant', 1);
        state.save();
        return true;
    }

    harvest(plotId, combatManager) {
        const plot = state.data.farmPlots.find(p => p.id === plotId);
        if (!plot || plot.status !== 'ready') return false;

        const config = this.cropConfig[plot.crop] || this.cropConfig.rice;
        const layout = this.plotLayouts.find(l => l.id === plotId);
        const plotCenterX = layout ? layout.x + layout.w / 2 : 750;
        const plotCenterY = layout ? layout.y + layout.h / 2 : 850;

        // Reset plot to empty
        plot.status = 'empty';
        plot.crop = null;
        plot.plantTime = 0;
        plot.growDuration = 0;

        // Rewards
        state.addGold(config.goldReward);
        state.addExp(config.expReward);
        if (config.diamondReward) {
            state.addDiamonds(config.diamondReward);
        }
        state.addItem(config.itemYield);

        // Progress Daily Quest
        state.progressQuest('plant', 1);
        state.progressQuest('resource', 1);

        sound.playHarvest();

        if (combatManager) {
            combatManager.addFloatingText(`+${config.goldReward.toLocaleString()} Vàng`, plotCenterX, plotCenterY - 20, '#fbbf24', true);
            combatManager.addFloatingText(`+${config.expReward} EXP`, plotCenterX, plotCenterY - 45, '#38bdf8');
            combatManager.addFloatingText(`+${config.itemYield.name}`, plotCenterX, plotCenterY - 70, '#4ade80');
        }

        state.save();
        return true;
    }

    water(plotId) {
        const plot = state.data.farmPlots.find(p => p.id === plotId);
        if (!plot || plot.status !== 'growing') return false;
        plot.watered = true;
        // reduce 30% remaining time
        plot.growDuration = Math.round(plot.growDuration * 0.7);
        sound.playClick();
        state.save();
        return true;
    }
}
