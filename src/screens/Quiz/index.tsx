import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

import { useNavigation, useRoute } from "@react-navigation/native";

import { styles } from "./styles";

import { QUIZ } from "../../data/quiz";
import { historyAdd } from "../../storage/quizHistoryStorage";

import { Loading } from "../../components/Loading";
import { Question } from "../../components/Question";
import { QuizHeader } from "../../components/QuizHeader";
import { ConfirmButton } from "../../components/ConfirmButton";
import { OutlineButton } from "../../components/OutlineButton";
import { ProgressBar } from "../../components/ProgressBar";
import { THEME } from "../../styles/theme";
import { OverlayFeedback } from "../../components/OverlayFeedback";

interface Params {
  id: string;
}

type QuizProps = (typeof QUIZ)[0];

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(
    null
  );

  const shake = useSharedValue(0);
  const scrollInY = useSharedValue(0);

  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;

  function handleSkipConfirm() {
    Alert.alert("Pular", "Deseja realmente pular a questão?", [
      { text: "Sim", onPress: () => handleNextQuestion() },
      { text: "Não", onPress: () => {} },
    ]);
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length,
    });

    navigate("finish", {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prevState) => prevState + 1);
    } else {
      handleFinished();
    }
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      return handleSkipConfirm();
    }

    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      setPoints((prevState) => prevState + 1);
    } else {
      shakeAnimation();
    }

    setAlternativeSelected(null);
  }

  function handleStop() {
    Alert.alert("Parar", "Deseja parar agora?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        style: "destructive",
        onPress: () => navigate("home"),
      },
    ]);

    return true;
  }

  function shakeAnimation() {
    shake.value = withSequence(
      withTiming(3, { duration: 400, easing: Easing.bounce }),
      withTiming(0)
    );
  }
  const shakeStyleAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shake.value,
            [0, 0.5, 1, 1.5, 2, 2.5, 3],
            [0, -15, 0, -15, 0, -15, 0]
          ),
        },
      ],
    };
  });

  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollInY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    const quizSelected = QUIZ.filter((item) => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (quiz.questions) {
      handleNextQuestion();
    }
  }, [points]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <OverlayFeedback status={0}/>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <QuizHeader
          title={quiz.title}
          currentQuestion={currentQuestion + 1}
          totalOfQuestions={quiz.questions.length}
        />
        <Animated.View style={[shakeStyleAnimation]}>
          <Question
            key={quiz.questions[currentQuestion].title}
            question={quiz.questions[currentQuestion]}
            alternativeSelected={alternativeSelected}
            setAlternativeSelected={setAlternativeSelected}
          />
        </Animated.View>
        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}
