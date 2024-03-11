import { Fragment, useState } from 'react'

import { useTheme } from 'next-themes'

import {
  Button,
  Checkbox,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@janhq/uikit'
import { Tooltip } from '@janhq/uikit'
import { useAtom, useSetAtom } from 'jotai'
import { ArrowLeftIcon, CommandIcon } from 'lucide-react'

import { twMerge } from 'tailwind-merge'

import useRecordHotkeys from '@/hooks/useRecordHotkeys'

import { defaultQuickAskHotKey } from '@/utils/config'
import { convertKeyToAccelerator } from '@/utils/keyboard'

import { onBoardingStepAtom, modalOnboardingAccesibilityAtom } from '..'

import ModalAccesibility from './ModalAccesibility'

const HotkeyOnBoarding = () => {
  const [onBoardingStep, setOnBoardingStep] = useAtom(onBoardingStepAtom)
  const setModalOnboardingAccesibility = useSetAtom(
    modalOnboardingAccesibilityAtom
  )
  const [checkboxState, setCheckboxState] = useState(true)

  const { resolvedTheme } = useTheme()

  const { keys, start, stop, isRecording, error, isValid, isHotkeyModifier } =
    useRecordHotkeys()

  const getModifierSymbol = (key: string) => {
    if (isHotkeyModifier(key)) {
      switch (key) {
        case 'meta':
          return <CommandIcon size={20} className="mx-auto stroke-2" />
      }
    }
    return key
  }

  const onContinueClick = async () => {
    if (checkboxState) {
      setOnBoardingStep(onBoardingStep + 1)
    } else {
      setModalOnboardingAccesibility(true)
    }

    if (isValid && keys.size > 0) {
      const keyCombination = convertKeyToAccelerator(Array.from(keys)).join('+')

      await window.core?.api?.setQuickAskHotKey(keyCombination)
      await window.core?.api?.updateAppConfiguration({
        quick_ask_hotkey: keyCombination,
      })
    } else {
      await window.core?.api?.setQuickAskHotKey(defaultQuickAskHotKey)
      await window.core?.api?.updateAppConfiguration({
        quick_ask_hotkey: defaultQuickAskHotKey,
      })
    }
  }

  return (
    <Fragment>
      <div className="flex w-full cursor-pointer p-2">
        <div className="item-center flex h-full w-3/5 flex-shrink-0 flex-col items-center justify-between rounded-lg bg-white px-8 py-14 dark:bg-background/70">
          <div className="w-full text-center">
            <h1 className="mt-2 text-3xl font-bold">
              <span className="rounded-l-lg border-r-4 border-yellow-500 bg-yellow-100 p-1 px-2 dark:bg-yellow-700">
                Hotkey
              </span>{' '}
              for Jan
            </h1>
            <p className="mx-auto mt-2 w-full text-base font-medium text-muted-foreground lg:w-3/5">
              You can ask Jan from anywhere using the following hotkey:
            </p>

            {/* UI of keycaps */}
            <div className="relative z-50 mb-10 mt-20 flex justify-center gap-4">
              {isRecording ? (
                <>
                  {keys.size === 0 ? (
                    <Tooltip open={isRecording}>
                      <TooltipTrigger asChild>
                        <div className="flex gap-4">
                          <div className="keycaps small placeholder" />
                          <div className="keycaps small placeholder" />
                        </div>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent
                          side="top"
                          className="max-w-[240px]"
                          sideOffset={20}
                        >
                          <span>Type & hold your key...</span>
                          <TooltipArrow />
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  ) : (
                    <Tooltip open={Boolean(error) || isRecording}>
                      <TooltipTrigger asChild>
                        <div className="flex gap-4">
                          {Array.from(keys).map((key) => {
                            return (
                              <div
                                key={key}
                                className={twMerge(
                                  'keycaps uppercase text-black',
                                  key.length <= 5 && 'small'
                                )}
                              >
                                {getModifierSymbol(key)}
                              </div>
                            )
                          })}
                          {!isValid && (
                            <div className="keycaps small placeholder" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent
                          side="top"
                          className={twMerge(
                            Boolean(error) && 'bg-red-500 dark:bg-red-500',
                            isValid &&
                              !error &&
                              'bg-green-500 dark:bg-green-500'
                          )}
                          sideOffset={20}
                        >
                          <span
                            className={twMerge(Boolean(error) && 'text-white')}
                          >
                            {error ||
                              (isValid && 'Your new key is set!') ||
                              'Type & hold your key...'}
                          </span>
                          <TooltipArrow
                            className={twMerge(
                              Boolean(error) &&
                                'fill-red-500 dark:fill-red-500',
                              isValid &&
                                !error &&
                                'fill-green-500 dark:fill-green-500'
                            )}
                          />
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  )}
                </>
              ) : (
                <Tooltip open={(isValid && !error) || keys.size > 0}>
                  <TooltipTrigger asChild>
                    <div className="flex gap-4">
                      <Fragment>
                        {Array.from(keys).map((key) => {
                          return (
                            <div
                              key={key}
                              className={twMerge(
                                'keycaps uppercase text-black',
                                key.length <= 5 && 'small'
                              )}
                            >
                              {getModifierSymbol(key)}
                            </div>
                          )
                        })}
                        {Array.from(keys).length === 0 && (
                          <>
                            <div className="keycaps small uppercase text-black">
                              {getModifierSymbol(isMac ? 'meta' : 'ctrl')}
                            </div>
                            <div className="keycaps small uppercase text-black">
                              J
                            </div>
                          </>
                        )}
                      </Fragment>
                    </div>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent
                      side="top"
                      className={twMerge('bg-green-500 dark:bg-green-500')}
                      sideOffset={20}
                    >
                      <span className={twMerge(Boolean(error) && 'text-white')}>
                        Your new key is set!
                      </span>
                      <TooltipArrow
                        className={twMerge(
                          'fill-green-500 dark:fill-green-500'
                        )}
                      />
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              )}
            </div>

            <div className="inline-block">
              {isRecording ? (
                <span className="cursor-pointer" onClick={stop}>
                  Cancel
                </span>
              ) : (
                <span className="cursor-pointer" onClick={start}>
                  Edit Hotkey
                </span>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center">
            <div className="mb-20 mt-10 flex flex-shrink-0 items-center space-x-2">
              <Checkbox
                id="accessibility"
                checked={checkboxState}
                onCheckedChange={(check) => setCheckboxState(Boolean(check))}
              />
              <label
                htmlFor="accessibility"
                className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable accessibility permissions for quick selection
              </label>
            </div>

            <div className="flex w-3/4 gap-4">
              <Button
                size="lg"
                themes="outline"
                className="w-12 p-0"
                onClick={() => setOnBoardingStep(onBoardingStep - 1)}
              >
                <ArrowLeftIcon size={20} />
              </Button>
              <Button block size="lg" onClick={onContinueClick}>
                Continue
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative -right-2 flex h-full w-full">
            <object
              type="image/svg+xml"
              data={
                resolvedTheme === 'dark'
                  ? 'images/quick-ask-animation-dark.svg'
                  : 'images/quick-ask-animation.svg'
              }
              className="mx-auto h-full w-full"
            />
          </div>
        </div>
      </div>
      <ModalAccesibility />
    </Fragment>
  )
}

export default HotkeyOnBoarding
