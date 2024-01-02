import {
  ArrowRightIcon,
  FolderIcon,
  FolderOpenIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Icon,
  Metric,
  ProgressCircle,
  Select,
  SelectItem,
  Tab,
  TabGroup,
  TabList,
  Text,
  Title,
} from '@tremor/react';
import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Axios from 'axios';
import { Socket, io } from 'socket.io-client';
import { List, ListItem } from '@tremor/react';

type UploadedFileType = {
  file: File;
  uploaded: boolean;
};

const models = ['tiny', 'base', 'small', 'medium', 'large', 'large-v2'];

export default function Home() {
  const [options, setOptions] = useState({
    selectedFromLanguage: 'ko',
    selectedToLanguage: 'ko',
    selectedModel: models[0],
  });
  const [uploadedFile, setUploadedFile] = useState<UploadedFileType[] | null>(
    null
  );
  const [outputFilePaths, setOutputFilePaths] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState<{
    key: 0 | 1;
    current: number;
    total: number;
  } | null>(null);

  const onFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;

    if (files) {
      const uploadedFile = Array.from(files).map((file) => ({
        uploaded: false,
        file,
      }));

      await Promise.all([
        uploadedFile.map(async (f) => {
          const formData = new FormData();
          formData.append('uploadFile', f.file);
          formData.append('fileName', f.file.name);

          const { status } = await Axios.post(
            'http://localhost:5050/uploaded',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              responseType: 'blob',
            }
          );

          if (status === 200) {
            setUploadedFile((prevUploadedFile) => {
              const sData = uploadedFile.map((x) => {
                if (x.file === f.file) {
                  x.uploaded = true;
                  return x;
                } else {
                  return x;
                }
              });

              return sData;
            });
          }
        }),
      ]);
    }
  };

  useEffect(() => {
    const socket = io('http://localhost:5050', {
      transports: ['websocket'],
    });
    // log socket connection
    socket.on('connect', () => {
      console.log('CONNECTED');
      setSocket(socket);
    });

    socket.on('message', (message) => {
      console.log(message);
      setProgress({
        key: message.key,
        total: message.total,
        current: message.current,
      });
    });

    socket.on('downloads', (message: string[]) => {
      console.log(message);
      setOutputFilePaths(message);
    });

    socket.on('end', () => {
      console.log('EXIT');
      setTimeout(() => {
        setProgress(null);
      }, 1000);
    });

    // socket disconnect on component unmount if exists
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    console.log(options);
    if (socket) {
      setProgress({
        key: 0,
        total: 100,
        current: 0,
      });
      socket.emit('uploaded', options);
      setUploadedFile(null);
    }
  };

  const handleFileClick = (fileName: string) => {
    console.log('click');
    if (socket) {
      socket.emit('download', fileName);
    }
  };

  useEffect(() => {
    console.log(options);
  }, [options]);

  return (
    <main className='flex p-4 gap-4 max-w-7xl w-full m-auto'>
      <form
        className='bg-white w-500 h-500 flex flex-col gap-4  max-w-[410px]'
        onSubmit={onSubmitHandler}
      >
        <div className='flex flex-col'>
          <span className='text-md'>모델 선택</span>
          <TabGroup
            defaultIndex={0}
            onIndexChange={(i) => {
              setOptions((prevOptions) => ({
                ...prevOptions,
                selectedModel: models[i],
              }));
            }}
          >
            <TabList variant='solid' className='mt-2' color='blue'>
              {models.map((model, i) => (
                <Tab className='text-xs' key={i}>
                  {model.toLocaleUpperCase()}
                </Tab>
              ))}
            </TabList>
          </TabGroup>
        </div>
        <div className=''>
          <span className='text-md'>언어 선택</span>
          <div className='flex gap-2  mt-2'>
            <Select
              className='text-xs'
              enableClear={false}
              defaultValue={options.selectedFromLanguage}
              onValueChange={(value) => {
                setOptions((prevOptions) => ({
                  ...prevOptions,
                  selectedFromLanguage: value,
                }));
              }}
            >
              <SelectItem value='en' className='text-xs'>
                ENGLISH
              </SelectItem>
              <SelectItem value='ko' className='text-xs'>
                KOREAN
              </SelectItem>
              <SelectItem value='ar' className='text-xs'>
                ARABIC
              </SelectItem>
            </Select>
            <ArrowRightIcon className='w-8' />
            <Select
              className='text-xs'
              enableClear={false}
              defaultValue={options.selectedToLanguage}
              onValueChange={(value) => {
                setOptions((prevOptions) => ({
                  ...prevOptions,
                  selectedToLanguage: value,
                }));
              }}
            >
              <SelectItem value='en' className='text-xs'>
                ENGLISH
              </SelectItem>
              <SelectItem value='ko' className='text-xs'>
                KOREAN
              </SelectItem>
              <SelectItem value='ar' className='text-xs'>
                ARABIC
              </SelectItem>
            </Select>
          </div>
        </div>
        <div className=''>
          <span className='text-md'>업로드</span>
          <ul className='border rounded px-2 py-2 bg-gray-50 flex flex-col gap-2 h-80 mt-2 relative overflow-auto'>
            {uploadedFile?.map((file, i) => (
              <li
                key={i}
                className='flex border rounded py-2 px-4 gap-3 bg-white'
              >
                <Icon
                  icon={FolderIcon}
                  variant='solid'
                  color={file.uploaded ? 'blue' : 'red'}
                />
                <div className='flex flex-col justify-center'>
                  <span className='text-[13px] leading-[15px] text-black font-medium max-w-[250px] whitespace-pre overflow-hidden text-ellipsis'>
                    {file?.file.name}
                  </span>
                  <span className='text-[11px] font-light'>
                    {file.uploaded ? '업로드 완료' : '업로드 중...'}
                  </span>
                </div>
                <Button
                  className='py-1 px-3 h-8 my-auto ml-auto'
                  variant='secondary'
                  color='red'
                  type='button'
                  onClick={async () => {
                    const data = Axios.post('http://localhost:5050/remove', {
                      fileName: file.file.name,
                    });

                    if ((await data).status === 200) {
                      setUploadedFile(
                        (prevUploadedFile) =>
                          prevUploadedFile?.filter(
                            (x) => x.file != file.file
                          ) ?? null
                      );
                    }
                  }}
                >
                  삭제
                </Button>
              </li>
            ))}
            <li
              className='border rounded py-2 bg-white text-sm text-center sticky bottom-0 right-2 left-2'
              style={{
                boxShadow: '0px -6px 20px 0px #000000e;',
              }}
            >
              <label htmlFor='fileArea' className='flex gap-1 justify-center'>
                <PlusCircleIcon className='w-4' />
                파일 업로드
                <input
                  id='fileArea'
                  type='file'
                  hidden
                  multiple
                  onChange={onFileUploadHandler}
                  required
                  name='fileList'
                />
              </label>
            </li>
          </ul>
        </div>
        <Button disabled={!uploadedFile} type='submit'>
          실행
        </Button>
      </form>
      <div className='w-full bg-gray-50 rounded relative overflow-hidden'>
        {progress ? (
          <div className='absolute right-0 left-0 top-0 bottom-0 flex items-center justify-center bg-[#00000011] flex-col gap-2'>
            <ProgressCircle
              value={progress.current}
              size='md'
              color={progress.key === 0 ? 'green' : 'yellow'}
            >
              <span className='text-xs text-gray-700 font-medium'>
                {progress.current}%
              </span>
            </ProgressCircle>
            <span className='flex text-xs text-gray-700 font-medium'>
              {progress.current >= 100
                ? progress.key === 0
                  ? '처리 완료 ✅'
                  : '번역 완료 ✅'
                : progress.key === 0
                ? '처리 중입니다...'
                : '번역 중입니다..'}
            </span>
          </div>
        ) : (
          <Image
            src='/logo.png'
            width={200}
            height={50}
            className='absolute right-0 left-0 top-0 bottom-0 m-auto invert opacity-25'
            alt='logo'
          />
        )}
      </div>

      {outputFilePaths.length > 0 && (
        <div className='w-full max-w-[250px] bg-gray-50 rounded relative p-4'>
          <List>
            {outputFilePaths.map((path, i) => (
              <a
                href={path.replaceAll('../frontend/public', '')}
                download={path.replaceAll('../frontend/public/output', '')}
                key={i}
              >
                <ListItem className='flex gap-2 justify-start t text-black text-xs py-1.5 underline'>
                  <FolderOpenIcon color='black' className='min-w-[1rem] w-4' />
                  <span className='whitespace-pre overflow-hidden text-ellipsis w-[80%]'>
                    {path.split('/')[4]}
                  </span>
                </ListItem>
              </a>
            ))}
          </List>
        </div>
      )}
    </main>
  );
}
