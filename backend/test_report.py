import asyncio
from app.services.report_fsm import ReportGeneratorFSM

async def main():
    print("Initializing FSM...")
    fsm = ReportGeneratorFSM("All")
    print("Running FSM...")
    try:
        buf = await fsm.run()
        print("Success! Buffer size is:", len(buf.getvalue()))
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
