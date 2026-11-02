import { useForm } from '@example/shared';
import { type UIStore } from '../UIStore';
import { type <FTName | pascalcase>Values } from '../types';

import { validationSchema } from './validation';

export const useLogic = (store: UIStore) => {
  const form = useForm<<FTName | pascalcase>Values>({
    validationSchema,
  });

  const handleFormSubmit = () => {};

  return {
    form,
    handleFormSubmit,
  };
};
