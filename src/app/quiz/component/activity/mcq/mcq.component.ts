import { Component, ViewChild, ViewChildren, ElementRef, OnInit, Output, EventEmitter } from '@angular/core';
import QuizData from './data';
import { SoundService } from '../../../service/sound.service';
const ASSETS = 'assets/audio/'

@Component({
  selector: 'app-mcq',
  templateUrl: './mcq.component.html',
  styleUrls: ['./mcq.component.scss'],
  providers: [SoundService]
})
export class McqComponent implements OnInit {
  currentPageData: any;
  currentPageNo: number = 1;
  subRoundPageNumber: number = 1;
  attempNo: number = 0;
  quizData: Array<any> = QuizData.quizData;
  currentSet: number;
  nextSet: number;
  nextSetIndex: number;
  repeatQs: boolean = false;
  highestSetValue: number;
  lastSet: boolean = false;
  questionInQueue: Array<any> = [];
  roundLevel: number = 1;
  currentSelectedOption: string;
  nextQsBlock: boolean = false;
  repeatQsBlock: boolean = false;
  vaultRoundDone: boolean = false;
  spliceIndex: number;
  disableSubmit: boolean = true;
  @ViewChildren('option') option: ElementRef;
  @ViewChildren('optionText') optionText: ElementRef;
  @Output() messageEvent = new EventEmitter<number>();
  @Output() vaultAnimData = new EventEmitter<object>();
  @Output() initVault = new EventEmitter<void>();
  constructor(private soundService: SoundService) { }

  ngOnInit() {
    this.messageEvent.emit(this.roundLevel);
    this.setAttemptedState();
    this.goToNextQuestion();
    this.highestSetValue = this.quizData[this.quizData.length - 1].set;
  };

  resetQuiz() {
    // initialize the values for reset
    this.currentPageNo = 1;
    this.subRoundPageNumber = 1;
    this.attempNo = 0;
    this.repeatQs = false;
    this.lastSet = false;
    this.questionInQueue = [];
    this.roundLevel = 1;
    this.disableSubmit = true;
    this.messageEvent.emit(this.roundLevel);
    //load the first page
    this.currentPageData = this.randomizeOptions(this.quizData[this.currentPageNo - 1], this.quizData[this.currentPageNo - 1].answer);
    this.currentSet = this.quizData[this.currentPageNo - 1].set;
    this.nextSet = this.quizData[this.currentPageNo].set;
    this.nextSetIndex = this.currentSet + 1;
    console.log(this.currentPageData);
    this.setAttemptedState();
    this.clearSelectedOption();
    this.initVault.emit();
  }
  /** 
   * Initializes the states as not attempted
  */
  setAttemptedState() {
    this.quizData.map((each, index) => {
      each.attemptState = "Not attempted";
    })
  }

  /** 
   * checks for last question in last set
  */
  checkLastSet(): Boolean {
    if ((this.currentPageData.questionText.trim() === this.quizData[this.quizData.length - 1].questionText.trim()) && (this.currentSet === this.highestSetValue)) {
      return true;
    } else {
      return false;
    }

  }

  /**
   * fetches the option selected by user
   * @param selectedOption selected option
   * @param idx index of the selected answer
   */
  selectAnswer(selectedOption, idx) {
    this.disableSubmit = false;
    this.currentSelectedOption = selectedOption;
    let option = this.option['_results'];
    option[idx].nativeElement.style = 'background-color:#fefe00';
    option.map((each, index) => {
      if (index !== idx) {
        option[index].nativeElement.style = 'background-color: #ededed';
      }
    })
  };

  /** 
   * repeat questions from present round, before moving to next round
  */
  repeatQuestion() {
    this.attempNo = 0;
    this.disableSubmit = true;
    this.currentPageData = this.randomizeOptions(this.questionInQueue[this.subRoundPageNumber - 1],
      this.questionInQueue[this.subRoundPageNumber - 1].answer);
    if (this.questionInQueue.length > 1) {
      this.currentSet = this.questionInQueue[this.subRoundPageNumber - 1].set;
      // for last element in question queue, nextset becomes nextsetindex
      if (this.subRoundPageNumber === this.questionInQueue.length) {
        this.nextSet = this.nextSetIndex;
      }
      else {
        this.nextSet = this.questionInQueue[this.subRoundPageNumber].set;
      }
    }
    else {
      this.currentSet = this.questionInQueue[this.subRoundPageNumber - 1].set;
      this.nextSet = this.nextSetIndex;
    }
  }
  /** 
   * Completion of current round
  */
  roundComplete() {
    this.roundLevel++;
    this.messageEvent.emit(this.roundLevel);
  }
  /** 
   * Show next question
  */
  goToNextQuestion() {
    // Check for last question
    if (this.lastSet) {
      return;
    }
    this.disableSubmit = true;
    this.attempNo = 0;
    this.currentPageData = this.randomizeOptions(this.quizData[this.currentPageNo - 1], this.quizData[this.currentPageNo - 1].answer);
    this.currentSet = this.quizData[this.currentPageNo - 1].set;
    if (this.currentSet === this.nextSetIndex) {
      this.roundComplete();
    }
    if (this.checkLastSet()) {
      this.lastSet = true;
      this.nextSet = 0;
    } else {
      this.nextSet = this.quizData[this.currentPageNo].set;
    }

    this.nextSetIndex = this.currentSet + 1;
  };

  /** 
   * Clear selected option after each attempt
  */
  clearSelectedOption() {
    let option = this.option['_results']
    option.map((each, index) => {
      option[index].nativeElement.style = 'background-color:#ededed';
    })
  };

  /** 
   * Clear selected text color for incorrect
  */
  clearSelectedText() {
    let optionText = this.optionText['_results'];
    optionText.map((each, index) => {
      optionText[index].nativeElement.style = 'color:#111';
    });
  };

  /**
   * Show correct answer for incorrect attempts
   */
  showCorrectAnswer() {
    let correctAns = this.currentPageData.options[this.currentPageData.answer];
    let optionText = this.optionText['_results'];

    optionText.map((each, index) => {
      if (each.nativeElement.innerText.toString().trim() === correctAns.toString().trim()) {
        optionText[index].nativeElement.style = 'color:#58ff00';
      }
      if (each.nativeElement.innerText.toString().trim() === this.currentSelectedOption.toString().trim()) {
        optionText[index].nativeElement.style = 'color:#ed1c24';
      }
    });
    setTimeout(() => {
      this.clearSelectedText();
    }, 600);
    this.checkQuestionSet();
  }

  /** 
   * Check for repeat round or next question
  */
  checkForRepeat() {
    if (this.nextQsBlock) {
      this.goToNextQuestion();
    }
    else if (this.repeatQsBlock) {
      this.repeatQuestion();
    }
  }

  /** 
   * check for set, round, vault animation
  */
  checkQuestionSet() {
    let prevIndex: number;
    // For same set question
    if (this.currentSet === this.nextSet) {
      // for repeat question set 
      if (this.repeatQs) {
        if (this.subRoundPageNumber < this.questionInQueue.length) {
          this.subRoundPageNumber++;
        }
        else if (this.subRoundPageNumber === this.questionInQueue.length) {
          this.subRoundPageNumber = 1;
        }
        this.repeatQsBlock = true;
        this.nextQsBlock = false;
        if (this.currentPageData.attemptState === 'correct' && !this.checkLastSet() && (this.currentSet !== this.nextSetIndex)) {
          this.vaultAnimData.emit({
            start: this.currentPageData.animationStartRange,
            stop: this.currentPageData.animationStopRange
          });

        }
        else {
          this.currentPageData.attemptState === 'incorrect';
          setTimeout(() => {
            this.checkForRepeat();
          }, 1200)
        }
      } else {
        //repeat for wrong answers
        this.currentPageNo++;
        if (this.currentPageData.attemptState === 'correct' && !this.checkLastSet() && (this.currentSet !== this.nextSetIndex)) {
          this.nextQsBlock = true;
          this.repeatQsBlock = false;
          this.vaultAnimData.emit({
            start: this.currentPageData.animationStartRange,
            stop: this.currentPageData.animationStopRange
          });
        }
        else {
          this.currentPageData.attemptState === 'incorrect';
          this.nextQsBlock = true;
          this.repeatQsBlock = false;
          setTimeout(() => {
            this.checkForRepeat();
          }, 1200)
        }
      }
    }
    //for different set questions
    else {
      // For correct all correct set
      if (this.questionInQueue.length === 0) {
        this.currentPageNo++;
        if (this.currentPageData.attemptState === 'correct' && !this.checkLastSet() && (this.currentSet !== this.nextSetIndex)) {
          if (this.currentSet + 1 !== this.nextSetIndex) {
            //for round complete repeatation not last question
            this.repeatQsBlock = false;
            this.nextQsBlock = true;
            this.vaultRoundDone = true;
            this.vaultAnimData.emit({
              start: this.currentPageData.animationStartRange,
              stop: this.currentPageData.animationStopRange
            });
          } else {
            this.repeatQsBlock = false;
            this.nextQsBlock = true;
            this.vaultRoundDone = false;
            this.vaultAnimData.emit({
              start: this.quizData[this.currentPageNo - 2].animationStartRange,
              stop: this.quizData[this.currentPageNo - 2].animationStopRange
            });
          }

        }
        else if (this.currentPageData.attemptState === 'correct' && this.checkLastSet()) {
          this.vaultAnimData.emit({
            start: this.quizData[this.quizData.length - 1].animationStartRange,
            stop: this.quizData[this.quizData.length - 1].animationStopRange
          });
        }
        //increase footer color count
      }
      else {
        this.subRoundPageNumber = 1;
        if (this.currentPageData.attemptState === 'correct') {
          this.quizData.map((each, idx) => {
            if (each.questionText.trim() === this.currentPageData.questionText.trim()) {
              prevIndex = idx - 1;
            }
          });
          this.repeatQsBlock = true;
          this.vaultRoundDone = false;
          this.nextQsBlock = false;
          this.vaultAnimData.emit({
            start: this.quizData[prevIndex].animationStartRange,
            stop: this.quizData[prevIndex].animationStopRange
          });
        }
        else if (this.currentPageData.attemptState === 'incorrect') {
          this.repeatQsBlock = true;
          this.nextQsBlock = false;
          setTimeout(() => {
            this.checkForRepeat();
          }, 1200)

        }
        //again go to same set question one after one
      }
    }
  }

  /** 
   * submit selected option as answer
  */
  submit() {
    let prevIndex: number;
    let matchedFLag: Boolean = false;
    this.disableSubmit = true;
    if (this.currentSelectedOption === this.currentPageData.options[this.currentPageData.answer]) {
      this.soundService.playSound(ASSETS + 'Correct.mp3');
      // when secondd time correct
      if (this.currentPageData.attemptState === 'incorrect') {
        this.currentPageData.attemptState = "correct";
        this.questionInQueue.map((each, idx) => {
          if (each.questionText === this.currentPageData.questionText) {
            this.spliceIndex = idx;
          }
        });
        this.questionInQueue.splice(this.spliceIndex, 1);
        this.subRoundPageNumber--; //subround count decreased for mid element correct
        console.log(this.questionInQueue);
        if (this.questionInQueue.length === 0) {
          this.repeatQs = false;
          this.subRoundPageNumber = 1;
        } else {
          this.repeatQs = true;
        }
        this.checkQuestionSet();
      }
      else {
        this.currentPageData.attemptState = "correct";
        this.checkQuestionSet();
      }
    } else {
      this.soundService.playSound(ASSETS + 'Incorrect.mp3');
      if (this.attempNo < 2) {
        this.attempNo++;
        if (this.attempNo === 2) {
          if (this.currentPageData.attemptState === "Not attempted") {
            this.currentPageData.attemptState = "incorrect";
            this.questionInQueue.push(this.currentPageData);
            this.repeatQs = false;
          }
          else {
            this.repeatQs = true;
          }
          this.showCorrectAnswer();
        }
      }
      else {
        this.goToNextQuestion();
      }
    }
    this.clearSelectedOption();

  };

  /**
   * 
   * @param eachObj each question object
   * @param correctOption correct option answer
   */
  randomizeOptions(eachObj, correctOption): any {
    let correctIndex: number;
    let optionArray: string[] = eachObj.options;
    let correctAns: string = eachObj.options[correctOption];
    let currentIndex = optionArray.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = optionArray[currentIndex];
      optionArray[currentIndex] = optionArray[randomIndex];
      optionArray[randomIndex] = temporaryValue;
    }

    eachObj.options.map((each, idx) => {
      if (each === correctAns) {
        correctIndex = idx;
      }
    });

    eachObj.answer = correctIndex;
    eachObj.options = optionArray;
    return eachObj;
  };

}
