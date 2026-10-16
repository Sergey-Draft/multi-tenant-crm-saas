import { getInitials } from '@/lib/utils';
import { getUserName } from './utils';

describe('getInitials', () => {

  it.each(
    [
    ["Иван Петров", "ИП"],
    ["Иван      Петров", "ИП"]
  ],
  )("возвращает %s → %s", (input, expected) => {
    // Arrange
    const result = getInitials(input);
    // Assert
    expect(result).toBe(expected);
  });
})


describe('getUserNameById', () => {
  const entities = [
    {value: '1', label: 'Петров Николай Иванович'},
    {value: '2', label: 'Зверев Артем Демидович'},
  ]

  it('возвращает юзера по его ИД', () => {

    const result = getUserName("1", entities)

    expect(result).toBe('Петров Николай Иванович')
  })
  
  it(`'возвращает 'unknown user' если id undefined`, () => {
    const result = getUserName(undefined , entities)

    expect(result).toEqual('unknown user')
  })

  it(`'возвращает 'unknown user' если id null`, () => {

    const result = getUserName(null , entities)

    expect(result).toEqual('unknown user')
  })

  it(`'возвращает undefined если userOptions не массив`, () => {
    const entities = undefined
    const result = getUserName( "1", entities)

    expect(result).toEqual('unknown user')
  })

  it(`'возвращает 'unknown user' если userOptions пустой массив`, () => {
    const entities = []
    const result = getUserName( "2" , entities)

    expect(result).toEqual('unknown user')
  })
})
