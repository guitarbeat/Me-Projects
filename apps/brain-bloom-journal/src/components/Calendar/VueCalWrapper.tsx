import { applyVueInReact } from 'veaury';
import { VueCal, addDatePrototypes } from 'vue-cal';
import 'vue-cal/style';
import { ComponentType } from 'react';

addDatePrototypes();

const VueCalWrapper = applyVueInReact(VueCal) as ComponentType<any>;

export default VueCalWrapper;
