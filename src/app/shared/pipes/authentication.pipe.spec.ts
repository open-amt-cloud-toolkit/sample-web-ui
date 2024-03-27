import { ToolkitPipe } from './authentication.pipe';

describe('AuthenticationPipe', () => {
  it('create an instance', () => {
    const pipe = new ToolkitPipe();
    expect(pipe).toBeTruthy();
  });
});
