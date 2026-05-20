import { Appliance } from '../types';

export const STANDARD_APPLIANCES: Appliance[] = [
  { id: 'led_bulb', name: 'LED Light Bulb', defaultWatts: 12, category: 'lighting', icon: 'Lightbulb' },
  { id: 'ceiling_fan', name: 'Ceiling Fan', defaultWatts: 75, category: 'cooling', icon: 'Wind' },
  { id: 'standing_fan', name: 'Standing Fan', defaultWatts: 55, category: 'cooling', icon: 'Wind' },
  { id: 'led_tv', name: 'LED Smart TV', defaultWatts: 110, category: 'entertainment', icon: 'Tv' },
  { id: 'decoder', name: 'DSTV / Gotv / StarTimes Decoder', defaultWatts: 20, category: 'entertainment', icon: 'Radio' },
  { id: 'sound_system', name: 'Home Theatre / Sound Bar', defaultWatts: 150, category: 'entertainment', icon: 'Music' },
  { id: 'laptop', name: 'Laptop Computer', defaultWatts: 65, category: 'electronics', icon: 'Laptop' },
  { id: 'phone_charger', name: 'Phone Charger', defaultWatts: 18, category: 'electronics', icon: 'Smartphone' },
  { id: 'desktop_pc', name: 'Desktop Workstation', defaultWatts: 250, category: 'electronics', icon: 'Monitor' },
  { id: 'small_fridge', name: 'Single-door Refrigerator', defaultWatts: 150, category: 'appliances', icon: 'Snowflake' },
  { id: 'large_fridge', name: 'Double-door Refrigerator', defaultWatts: 250, category: 'appliances', icon: 'Snowflake' },
  { id: 'deep_freezer', name: 'Chest Freezer', defaultWatts: 200, category: 'appliances', icon: 'Snowflake' },
  { id: 'ac_1hp', name: 'Air Conditioner (1.0 HP)', defaultWatts: 746, category: 'cooling', icon: 'Cpu' },
  { id: 'ac_1_5hp', name: 'Air Conditioner (1.5 HP)', defaultWatts: 1120, category: 'cooling', icon: 'Cpu' },
  { id: 'water_pump_0_5hp', name: 'Water Pump (0.5 HP)', defaultWatts: 373, category: 'appliances', icon: 'Droplets' },
  { id: 'water_pump_1hp', name: 'Water Pump (1.0 HP)', defaultWatts: 746, category: 'appliances', icon: 'Droplets' },
  { id: 'microwave', name: 'Microwave Oven', defaultWatts: 1200, category: 'heating', icon: 'Flame' },
  { id: 'electric_kettle', name: 'Electric Kettle', defaultWatts: 2000, category: 'heating', icon: 'Coffee' },
  { id: 'electric_iron', name: 'Electric Pressing Iron', defaultWatts: 1200, category: 'heating', icon: 'Layers' },
  { id: 'washing_machine', name: 'Washing Machine', defaultWatts: 450, category: 'appliances', icon: 'RefreshCw' },
  { id: 'blender', name: 'Kitchen Blender', defaultWatts: 350, category: 'appliances', icon: 'Shuffle' }
];
