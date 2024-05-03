import { View } from 'react-native';

import { styles } from './styles';

import Animated,{useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import { useEffect } from 'react';
interface Props {
  total: number;
  current: number;
}

export function ProgressBar({ total, current }: Props) {
  const percentage = Math.round((current / total) * 100);

  const sharedProgress = useSharedValue(percentage); //Cria o equivalente a um var para compartilhar o valor
  const styledAnimated = useAnimatedStyle(()=>{ //Cria o estilo que a animação vai seguir
    return {
      width: `${sharedProgress.value}%`
    }
  })

  useEffect(()=>{
    sharedProgress.value = withTiming(percentage,{ //Altera o valor do var
      duration: 700 //o tempo que a animação vai levar para ser realizada
    });
  },[current])

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.progress,styledAnimated]} />
    </View>
  );
}